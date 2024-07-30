const axios = require('axios');

const {PrismaClient} = require('@prisma/client');
const {scrapeArticle} = require('../utils/scraper');
const {updateArticleKeywords} = require('../utils/keywordExtract');
const {detectAIContent} = require('../index');

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
      const aiScores = await detectAIContent(formattedContent);
      await prisma.article.upsert({
        where: {title: article.title},
        update: {},
        create: {
          title: article.title,
          description: article.description || 'No description available',
          author: article.creator || [], // Initialize with an empty array if null
          url: article.link,
          keywords: article.keywords || [], // Initialize with an empty array if null
          publishedAt: new Date(article.pubDate || Date.now()), // Provide current date if pubDate is missing
          content: formattedContent, // Save the formatted content as an array of paragraphs
          realScore: aiScores.realScore,
          fakeScore: aiScores.fakeScore,
        },
      });
    }
    console.log('Articles fetched and stored successfully.');
  } catch (error) {
    console.error('Error fetching and storing articles:', error);
  }
};

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
        const aiScores = await detectAIContent(formattedContent);

        await prisma.article.upsert({
          where: {title: article.title},
          update: {},
          create: {
            title: article.title,
            description: article.description || 'No description available',
            author: article.creator || [],
            url: article.link,
            keywords: article.keywords || [],
            publishedAt: new Date(article.pubDate || Date.now()),
            content: formattedContent, // Save the formatted content as an array of paragraphs
            realScore: aiScores.realScore,
            fakeScore: aiScores.fakeScore,
          },
        });
      }
    } catch (error) {
      console.error(`Error fetching articles for topic ${topic}:`, error);
    }
  }
  updateArticleKeywords(); // ensure all article's keywords fields are non-empty
  console.log('Articles fetched and cached successfully.');
};

module.exports = {
  fetchAndCacheArticlesByTopics,
  fetchAndStoreArticles,
};
