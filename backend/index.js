const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const {PrismaClient} = require('@prisma/client');
const {createClient} = require('@supabase/supabase-js');
const {OAuth2Client} = require('google-auth-library');
const cron = require('node-cron');
const axios = require('axios');
const Replicate = require('replicate');
const Groq = require('groq-sdk');
const natural = require('natural');
const stopword = require('stopword');
bodyParser = require('body-parser');

const {scrapeArticle} = require('./utils/scraper');
const {
  getAllPreferredTopics,
  generateFrequencyDictionary,
  findSimilarUsers,
  recommendArticles,
} = require('./utils/recommendUtils');
const {updateArticleKeywords} = require('./utils/keywordExtract');
const authRoutes = require('./routes/authRoutes');
const pulsecheckRoutes = require('./routes/pulsecheckRoutes');
const userActionRoutes = require('./routes/userActionRoutes');
const articleRoutes = require('./routes/articleRoutes');

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const replicate = new Replicate();
const groq = new Groq({apiKey: process.env.GROQ_API_KEY});
const tokenizer = new natural.WordTokenizer();

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/llama3', pulsecheckRoutes);
app.use('/update', userActionRoutes);
app.use('/api', articleRoutes);

app.listen(PORT, () => {
  // console.log(`Server running on http://localhost:${PORT}`);
});

// AI-content detection scoring
app.post('/api/detect-ai-content-hf', async (req, res) => {
  const {content, articleId} = req.body;
  const hfApiKey = process.env.HF_API_KEY;
  if (!content || !articleId) {
    return res.status(400).json({error: 'Text and articleId are required.'});
  }

  try {
    // Fetch article from the database
    const article = await prisma.article.findUnique({
      where: {id: articleId},
    });

    // Check if the scores are already calculated
    if (article && article.realScore !== 0.0 && article.fakeScore !== 0.0) {
      return res.json({
        realScore: article.realScore,
        fakeScore: article.fakeScore,
      });
    }

    // If scores are not present, calculate them using Hugging Face API
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/openai-community/roberta-base-openai-detector',
      {inputs: content},
      {
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const realScore = response.data[0][0].score;
    const fakeScore = response.data[0][1].score;

    // Update the article with the new scores
    await prisma.article.update({
      where: {id: articleId},
      data: {
        realScore,
        fakeScore,
      },
    });

    res.json({realScore, fakeScore});
  } catch (error) {
    console.error('Error detecting AI content:', error);
    res.status(500).json({error: 'Error detecting AI content'});
  }
});

const truncateText = contentString => {
  const words = contentString.split(/\s+/);
  if (words.length > 300) {
    return words.slice(0, 300).join(' ');
  }
  return contentString;
};

// Function for AI-generated content detection scoring
const detectAIContent = async content => {
  const contentString = content.join(' ');
  const removeNewLineContent = contentString.replace(/[\r\n]+/g, ' ');

  const truncatedContent = truncateText(removeNewLineContent);

  console.log(truncatedContent);
  const hfApiKey = process.env.HF_API_KEY;
  if (!content) {
    throw new Error('Content is required.');
  }

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/openai-community/roberta-base-openai-detector',
      {inputs: truncatedContent},
      {
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const realScore = response.data[0][0].score;
    const fakeScore = response.data[0][1].score;

    return {realScore, fakeScore};
  } catch (error) {
    console.error('Error detecting AI content:', error);
    throw new Error('Error detecting AI content');
  }
};

module.exports = {detectAIContent};

// Function to fetch title of most recent articles for each topic
// @TODO: filter out null values
const getMostRecentArticlesByKeywords = async (keywords, limit = 2) => {
  // Lowercase the keywords for case-insensitive search
  const lowercasedKeywords = keywords.map(k => k.toLowerCase());

  // Fetch articles with keywords in a single query
  const articles = await prisma.article.findMany({
    where: {
      OR: lowercasedKeywords.map(keyword => ({
        keywords: {
          has: keyword,
        },
      })),
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  // Group articles by keyword and limit the number of articles per keyword
  const articlesByKeyword = {};
  lowercasedKeywords.forEach(keyword => {
    articlesByKeyword[keyword] = articles
      .filter(article => article.keywords.includes(keyword))
      .slice(0, limit)
      .map(article => article.title);
  });

  return articlesByKeyword;
};

// Get article headlines for marquee
app.get(`/relevant-articles`, async (req, res) => {
  const {topics} = req.query;

  if (!topics) {
    return res.status(400).json({error: 'Topics parameter is required'});
  }

  try {
    const topicsArray = Array.isArray(topics) ? topics : topics.split(','); // Ensure topics is an array
    const articles = await getMostRecentArticlesByKeywords(topicsArray);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching headlines: ', error);
    res.status(500).json({error: 'Error fetching headlines'});
  }
});
