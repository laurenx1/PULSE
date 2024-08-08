// cron
// getAllPreferredTopics
// generateFrequencDictionary
const cron = require('node-cron');
const {
  getAllPreferredTopics,
  generateFrequencyDictionary,
  findSimilarUsers,
  recommendArticles,
} = require('../utils/recommendUtils');

const {
  fetchAndCacheArticlesByTopics,
  fetchAndStoreArticles,
} = require('./articleFetchAndCache');

const scheduleArticleFetching = () => {
  // Schedule the article fetching and caching to run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    // Fetch and store the latest articles
    await fetchAndStoreArticles();

    // Retrieve all user preferred topics
    const preferredTopics = await getAllPreferredTopics();
    // Generate a frequency dictionary for the preferred topics
    const frequencyDict = generateFrequencyDictionary(preferredTopics);
    const sortedTopics = Object.keys(frequencyDict).sort(
      (a, b) => frequencyDict[b] - frequencyDict[a],
    );
    const topNTopics = sortedTopics.slice(0, 5);
    // Fetch and cache articles for the top 5 topics
    await fetchAndCacheArticlesByTopics(topNTopics);
  });

  // Immediately fetch and store the latest articles
  fetchAndStoreArticles();
  (async () => {
    const preferredTopics = await getAllPreferredTopics();
    const frequencyDict = generateFrequencyDictionary(preferredTopics);
    const sortedTopics = Object.keys(frequencyDict).sort(
      (a, b) => frequencyDict[b] - frequencyDict[a],
    );
    const topNTopics = sortedTopics.slice(0, 5);

    await fetchAndCacheArticlesByTopics(topNTopics);
  })();
};

scheduleArticleFetching();
