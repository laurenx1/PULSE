const express = require('express');
const bcrypt = require('bcrypt');
const {PrismaClient} = require('@prisma/client');
const {OAuth2Client} = require('google-auth-library');

const {
  findSimilarUsers,
  recommendArticles,
} = require('../utils/recommendUtils.js');
const {
  getCombinations,
  fetchPulseCheckArticles,
} = require('../utils/pulseCheckUtils.js');
const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

/**
 * GET /articles
 * Fetches the top 10 most recently published articles from the database.
 *
 * @route GET /articles
 * @returns {Object[]} 200 - An array of article objects sorted by publication date.
 * @returns {Object} 500 - Internal server error message.
 */
router.get('/articles', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: {
        publishedAt: 'desc',
      },
      take: 10,
    });
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({error: 'Error fetching articles'});
  }
});

/**
 * GET /interactedArticles
 * Fetches articles that a user has either liked or saved, based on the provided type.
 *
 * @route GET /interactedArticles
 * @param {string} type - The type of interaction ('liked' or 'saved').
 * @param {string} userId - The ID of the user.
 * @returns {Object[]} 200 - An array of interacted article objects sorted by publication date.
 * @returns {Object} 404 - User not found error message.
 * @returns {Object} 500 - Internal server error message.
 */
router.get('/interactedArticles', async (req, res) => {
  const {type, userId} = req.query; // type can be 'liked' or 'saved'

  try {
    const user = await prisma.user.findUnique({
      where: {id: parseInt(userId)},
      include: {interactions: true},
    });

    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    const articleIds = user[type] || [];
    const articles = await prisma.article.findMany({
      where: {id: {in: articleIds}},
      orderBy: {publishedAt: 'desc'},
    });

    res.json(articles);
  } catch (error) {
    console.error(`Error fetching ${type} articles:`, error);
    res.status(500).json({error: `Error fetching ${type} articles`});
  }
});

/**
 * GET /recommendations/:userId
 * Generates article recommendations for a user based on collaborative filtering.
 *
 * @route GET /recommendations/:userId
 * @param {number} userId - The ID of the user to generate recommendations for.
 * @returns {Object[]} 200 - An array of recommended article objects.
 * @returns {Object} 500 - Internal server error message.
 */
router.get('/recommendations/:userId', async (req, res) => {
  const targetUserId = parseInt(req.params.userId);
  const similarityThreshold = 0; // Adjust later

  try {
    const targetUser = await prisma.user.findUnique({
      where: {id: targetUserId},
      include: {interactions: true},
    });

    const allUsers = await prisma.user.findMany({
      include: {interactions: true},
    });
    const allArticles = await prisma.article.findMany({
      orderBy: {
        publishedAt: 'desc',
      },
      // take: 200
    });

    const similarUsers = findSimilarUsers(
      targetUser,
      allUsers,
      similarityThreshold,
    );
    const recommendedArticles = recommendArticles(
      targetUser,
      similarUsers,
      allArticles,
    );

    res.json(recommendedArticles);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({error: 'Error generating recommendations'});
  }
});

/**
 * GET /pulsecheck/articles
 * Fetches articles related to a set of keywords for PULSECHECK queries.
 *
 * @route GET /pulsecheck/articles
 * @param {string[]} pulseCheckKeywords - An array of keywords to search articles for.
 * @returns {Object[]} 200 - An array of article objects matching the keywords.
 * @returns {Object} 400 - Keywords are required error message.
 * @returns {Object} 500 - Internal server error message.
 */
router.get('/pulsecheck/articles', async (req, res) => {
  // Get the pulseCheckKeywords query parameter, which is expected to be an array
  const pulseCheckKeywords = req.query.pulseCheckKeywords;

  // Ensure pulseCheckKeywords is an array
  const keywords = Array.isArray(pulseCheckKeywords) ? pulseCheckKeywords : [];

  if (keywords.length === 0) {
    return res.status(400).json({error: 'Keywords are required'});
  }

  try {
    // Fetch articles based on the keywords array
    const articles = await fetchPulseCheckArticles(keywords);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching pulsecheck articles:', error);
    res.status(500).json({error: 'Error fetching pulsecheck articles'});
  }
});

module.exports = router;
