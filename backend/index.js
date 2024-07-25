const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const { OAuth2Client } = require('google-auth-library');
const cron = require('node-cron');
const axios = require('axios');
const Replicate = require("replicate");
const Groq = require("groq-sdk");
const natural = require('natural');
const stopword = require('stopword');
bodyParser = require('body-parser');

const { scrapeArticle } = require('./scraper');
const { getAllPreferredTopics, generateFrequencyDictionary, calculateUserSimilarity, findSimilarUsers, recommendArticles } = require('./recommendUtils');
const authRoutes = require('./authRoutes');
const pulsecheckRoutes = require('./pulsecheckRoutes')
const userActionRoutes = require('./userActionRoutes')


const prisma = new PrismaClient();
const app = express();
const PORT = 3000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const replicate = new Replicate(); 
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tokenizer = new natural.WordTokenizer();


app.use(bodyParser.json());
app.use(express.json());
app.use(cors()); 


app.use('/auth', authRoutes);
app.use('/llama3', pulsecheckRoutes);
app.use('/update', userActionRoutes);



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



const fetchAndStoreArticles = async () => {
  const apiKey = process.env.NEWS_API_KEY;
  try {
    const response = await axios.get('https://newsdata.io/api/1/latest?', {
      params: {
        apikey: apiKey,
        q: 'breaking',
        country: 'us',
      },
    });
    const articles = response.data.results || [];

    for (const article of articles) {
      const formattedContent = await scrapeArticle(article.link); // Scrape the content

      await prisma.article.upsert({
        where: { title: article.title },
        update: {},
        create: {
          title: article.title,
          description: article.description || 'No description available',
          author: article.creator || [], // Initialize with an empty array if null
          url: article.link,
          keywords: article.keywords || [], // Initialize with an empty array if null
          publishedAt: new Date(article.pubDate || Date.now()), // Provide current date if pubDate is missing
          content: formattedContent, // Save the formatted content as an array of paragraphs
        },
      });
    }
    console.log('Articles fetched and stored successfully.');
  } catch (error) {
    console.error('Error fetching and storing articles:', error);
  }
};


app.get('/api/articles', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: {
        publishedAt: 'desc'
      },
      take: 10
    });
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Error fetching articles' });
  }
});


app.post('/api/detect-ai-content-hf', async (req, res) => {
  const { content, articleId } = req.body;
  const hfApiKey = process.env.HF_API_KEY;
  if (!content || !articleId) {
      return res.status(400).json({ error: 'Text and articleId are required.' });
  }

  try {
      // Fetch article from the database
      const article = await prisma.article.findUnique({
          where: { id: articleId },
      });

      // Check if the scores are already calculated
      if (article && article.realScore !== 0.0 && article.fakeScore !== 0.0) {
          return res.json({ realScore: article.realScore, fakeScore: article.fakeScore });
      }

      // If scores are not present, calculate them using Hugging Face API
      const response = await axios.post(
          "https://api-inference.huggingface.co/models/openai-community/roberta-base-openai-detector",
          { inputs: content },
          {
              headers: {
                  'Authorization': `Bearer ${hfApiKey}`,
                  'Content-Type': 'application/json',
              },
          }
      );

      const realScore = response.data[0][0].score;
      const fakeScore = response.data[0][1].score;

      // Update the article with the new scores
      await prisma.article.update({
          where: { id: articleId },
          data: {
              realScore,
              fakeScore,
          },
      });

      res.json({ realScore, fakeScore });
  } catch (error) {
      console.error('Error detecting AI content:', error);
      res.status(500).json({ error: 'Error detecting AI content' });
  }
});



// view liked or saved articles 
app.get('/api/interactedArticles', async (req, res) => {
  const { type, userId } = req.query; // type can be 'liked' or 'saved'

  try {
      const user = await prisma.user.findUnique({
          where: { id: parseInt(userId) },
          include: { interactions: true },
      });

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      const articleIds = user[type] || [];
      const articles = await prisma.article.findMany({
          where: { id: { in: articleIds } },
          orderBy: { publishedAt: 'desc' },
      });

      res.json(articles);
  } catch (error) {
      console.error(`Error fetching ${type} articles:`, error);
      res.status(500).json({ error: `Error fetching ${type} articles` });
  }
});


// Function to fetch title of most recent articles for each topic 
// @TODO: filter out null values
const getMostRecentArticlesByKeywords = async (keywords, limit = 2) => {
  const articlesByKeyword = {};

  for (const keyword of keywords.map(k => k.toLowerCase())) {
      const articles = await prisma.article.findMany({
          where: {
              keywords: {
                  has: keyword
              }
          },
          orderBy: {
              publishedAt: 'desc'
          },
          take: limit
      });

      if (articles.length > 0) {
          articlesByKeyword[keyword] = articles.map(article => article.title);
      }
  }
  return articlesByKeyword;
};


// get article headlines for marquee
app.get(`/relevant-articles`, async (req, res) => {
  const { topics } = req.query;

  if (!topics) {
    return res.status(400).json({ error: 'Topics parameter is required' });
  }

  try {
    const topicsArray = Array.isArray(topics) ? topics : topics.split(','); // Ensure topics is an array
    const articles = await getMostRecentArticlesByKeywords(topicsArray);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching headlines: ', error);
    res.status(500).json({ error: 'Error fetching headlines' });
  }
});





// fetch and cache articles based on the topics in this frequency dictionary
const fetchAndCacheArticlesByTopics = async (topics, limit = 3) => {
  const apiKey = process.env.NEWS_API_KEY;
  const articles = [];

  for (const topic of topics) {
    try {
      const response = await axios.get('https://newsdata.io/api/1/latest?', {
        params: {
          apikey: apiKey,
          q: topic,
          country: 'us',
        },
      });

      const topicArticles = response.data.results || [];
      articles.push(...topicArticles.slice(0, limit)); // Limit articles per topic

      for (const article of topicArticles) {
        const formattedContent = await scrapeArticle(article.link); // Scrape the content

        await prisma.article.upsert({
          where: { title: article.title },
          update: {},
          create: {
            title: article.title,
            description: article.description || "No description available",
            author: article.creator || [],
            url: article.link,
            keywords: article.keywords || [],
            publishedAt: new Date(article.pubDate || Date.now()),
            content: formattedContent, // Save the formatted content as an array of paragraphs
          },
        });
      }
    } catch (error) {
      console.error(`Error fetching articles for topic ${topic}:`, error);
    }
  }

  console.log('Articles fetched and cached successfully.');
};


const scheduleArticleFetching = () => {
  // Schedule the article fetching and caching to run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    // Fetch and store the latest articles
    await fetchAndStoreArticles();

    // Retrieve all user preferred topics
    const preferredTopics = await getAllPreferredTopics();
    // Generate a frequency dictionary for the preferred topics
    const frequencyDict = generateFrequencyDictionary(preferredTopics);
    const sortedTopics = Object.keys(frequencyDict).sort((a, b) => frequencyDict[b] - frequencyDict[a]);
    const topNTopics = sortedTopics.slice(0, 5);
    // Fetch and cache articles for the top 5 topics
    await fetchAndCacheArticlesByTopics(topNTopics);
  });

  // Immediately fetch and store the latest articles
  fetchAndStoreArticles();
  (async () => {
    const preferredTopics = await getAllPreferredTopics();
    const frequencyDict = generateFrequencyDictionary(preferredTopics);
    const sortedTopics = Object.keys(frequencyDict).sort((a, b) => frequencyDict[b] - frequencyDict[a]);
    const topNTopics = sortedTopics.slice(0, 5);

    await fetchAndCacheArticlesByTopics(topNTopics);
  })();
};

scheduleArticleFetching();


// create API endpoint to get recommended articles. 
// @TODO: build bigger user base for dev purposes. 
app.get('/api/recommendations/:userId', async (req, res) => {
  const targetUserId = parseInt(req.params.userId);
  const similarityThreshold = 0; // adjust later
  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { interactions: true }
    }); 

    const allUsers = await prisma.user.findMany({ include: { interactions: true } });
    const allArticles = await prisma.article.findMany({ 
      orderBy: {
        publishedAt: 'desc'
      },
      // take: 200
     });

    const similarUsers = findSimilarUsers(targetUser, allUsers, similarityThreshold);
    const recommendedArticles = recommendArticles(targetUser, similarUsers, allArticles);

    res.json(recommendedArticles);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Error generating recommendations' });
  }

});





// keyword sweep to populate Article s.t. every article has keywords extracted

// extract keywords from a title
const extractKeywords = (title, numKeywords=5) => {
  const wordCount = {};
  const words = tokenizer.tokenize(title.toLowerCase()); // convert to lowercase, tokenize into individual words
  const filteredWords = stopword.removeStopwords(words); // remove common stop words (and, the, etc.)

  filteredWords.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1; 
  });

  const sortedWords = Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .map(([word]) => word);

    return sortedWords.slice(0, numKeywords); // return the top numKeywords words from the sorted list.
};


// sweep through articles, fill in keywords field for articles with none. 
async function updateArticleKeywords() {
  try {
      // Fetch all articles
      const articles = await prisma.article.findMany();

      for (const article of articles) {
          // Check if the keywords array is empty
          if (article.keywords.length === 0) {
              // Extract keywords from the title
              const keywords = extractKeywords(article.title);
              // Update the article with the new keywords
              await prisma.article.update({
                  where: { id: article.id },
                  data: { keywords },
              });
          }
      }
  } catch (error) {
      console.error('Error updating keywords:', error);
  } 
}; 

updateArticleKeywords();









