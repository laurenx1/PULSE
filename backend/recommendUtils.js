
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// fetch preferred topics across all users
const getAllPreferredTopics = async () => {
    try {
      const users = await prisma.user.findMany({
        select: {
          preferredTopics: true,
        },
      });
  
      // transform and flatten an array of arrays into a single array.
      return users.flatMap(user => user.preferredTopics); 
    } catch (error) {
      console.error('Error fetching preferred topics:', error);
    }
  };
  
  
  // generate a frequency dictionary of the topics that users are interested in. 
  const generateFrequencyDictionary = (topics) => {
    const frequencyDict = {};
  
    topics.forEach(topic => {
      if (!frequencyDict[topic]) {
        frequencyDict[topic] = 0;
      }
      frequencyDict[topic] += 1;
    });
  
    return frequencyDict;
  };

  // calculate a similarity score between 2 users based on common likes, saves and preferredTopics
const calculateUserSimilarity = (user1, user2) => {
    const commonLikes = user1.liked.filter(articleId => user2.liked.includes(articleId));
    const commonSaves = user1.saved.filter(articleId => user2.saved.includes(articleId));
    const commonSaveToLike = user1.saved.filter(articleId => user2.liked.includes(articleId));
    const commonLikeToSave = user1.liked.filter(articleId => user2.saved.includes(articleId));
    const commonTopics = user1.preferredTopics.filter(topic => user2.preferredTopics.includes(topic));
  
    const weight1 = 3; // Weight for common likes - middle weight because liked is more relevant than topics chosen when setting up profile
    const weight2 = 4; // Weight for common saves - most weight because saved holds gravity
    const weight3 = 2; // Weight for common topics - least wegiht because initial interests (can be changed but matters less than the articles)
    const weight4 = 2; 
    const weight5 = 2; 
  
    const similarityScore = (weight1 * commonLikes.length) + (weight2 * commonSaves.length) + (weight3 * commonTopics.length) + (weight4 * commonLikeToSave.length) + (weight5 * commonSaveToLike.length);
  
    return similarityScore;
  };
  
  
  // find similar users
  const findSimilarUsers = (targetUser, allUsers, similarityThreshold) => {
    return allUsers.filter(user => {
      if (user.id !== targetUser.id) {
        const similarityScore = calculateUserSimilarity(targetUser, user);
        return similarityScore > similarityThreshold;
      }
      return false;
    });
  };
  
  

  // recommend articles based on what similar users liked, saved that target user has not interacted with yet. 
  const recommendArticles = (targetUser, similarUsers, allArticles) => {
    const articleScores = {};
  
    // for each similar user
    similarUsers.forEach(similarUser => {
      // loop through that user's interactions
      similarUser.interactions.forEach(interaction => {
        if ((interaction.liked || interaction.saved) &&
            !targetUser.liked.includes(interaction.articleId) &&
            !targetUser.saved.includes(interaction.articleId)) {
          if (!articleScores[interaction.articleId]) {
            articleScores[interaction.articleId] = 0;
          }
          // if article has been liked / saved by similar user and not by target users, add to its score
          articleScores[interaction.articleId] += 1;
        }
      });
    });
  
    // sort articles from highest to lowest score
    const sortedArticleIds = Object.keys(articleScores).sort((a, b) => articleScores[b] - articleScores[a]);
  
    // get articleIds of the articles so they can be fetched to target user 
    return sortedArticleIds.map(articleId => allArticles.find(article => article.id === parseInt(articleId)));
  };

  module.exports = { getAllPreferredTopics, generateFrequencyDictionary, findSimilarUsers, recommendArticles };