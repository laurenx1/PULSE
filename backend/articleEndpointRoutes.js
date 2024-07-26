const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { OAuth2Client } = require('google-auth-library');


const { findSimilarUsers, recommendArticles } = require('./recommendUtils');
const { getCombinations, fetchPulseCheckArticles} = require('./pulseCheckUtils');
const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// gets top articles from the database -> takes the last 10 added 
router.get('/articles', async (req, res) => {
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



// gets liked or saved articles, depending on type provided
router.get('/interactedArticles', async (req, res) => {
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


router.get('/recommendations/:userId', async (req, res) => {
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


  router.get('/pulsecheck/articles', async (req, res) => {
    // Get the pulseCheckKeywords query parameter, which is expected to be an array
    const pulseCheckKeywords = req.query.pulseCheckKeywords;
  
    // Ensure pulseCheckKeywords is an array
    const keywords = Array.isArray(pulseCheckKeywords) ? pulseCheckKeywords : [];
  
    if (keywords.length === 0) {
        return res.status(400).json({ error: 'Keywords are required' });
    }
  
    try {
        // Fetch articles based on the keywords array
        const articles = await fetchPulseCheckArticles(keywords);
        res.json(articles);
    } catch (error) {
        console.error('Error fetching pulsecheck articles:', error);
        res.status(500).json({ error: 'Error fetching pulsecheck articles' });
    }
  });


module.exports = router;