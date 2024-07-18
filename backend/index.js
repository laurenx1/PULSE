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



const prisma = new PrismaClient();
const app = express();
const PORT = 3000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const replicate = new Replicate(); 
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


app.use(express.json());
app.use(cors()); 


// Register a new user
app.post('/api/register', async (req, res) => {
  const { email, username, password } = req.body;

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });
    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: 'Error registering user' });
  }
});


// Login an existing user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, error: 'Error logging in' });
  }
});

// Login user woth google
app.post('/api/google-login', async (req, res) => {
    const { token } = req.body;
  
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { email, name, picture } = payload;
  
      let user = await prisma.user.findUnique({ where: { email } });
  
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            username: name,
            picture,
          },
        });
      }
  
      res.json({ success: true, user });
    } catch (error) {
      console.error('Error with Google login:', error);
      res.status(500).json({ success: false, error: 'Error with Google login' });
    }
  });


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// update preferredTopics, lastRead
app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { preferredTopics, lastRead } = req.body;

  try {
      const data = {};
      if (preferredTopics !== undefined) {
          data.preferredTopics = preferredTopics;
      }
      if (lastRead !== undefined) {
          data.lastRead = lastRead;
      }

      const user = await prisma.user.update({
          where: { id: parseInt(id) },
          data,
      });

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).send({ message: 'User updated successfully!', user });
      console.log(data.preferredTopics);
  } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).send({ error: 'Failed to update user.' });
  }
});


  // Function to fetch and store articles
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
  console.log(content);
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



// Like an article
app.post('/api/articles/:articleId/like', async (req, res) => {
    const { articleId } = req.params;
    const { userId } = req.body;
  
    try {
      // Update the likes count in the Article model
      await prisma.article.update({
        where: { id: parseInt(articleId) },
        data: {
          likes: {
            increment: 1,
          },
        },
      });
  
      // Update the liked articles in the User model
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          liked: {
            push: parseInt(articleId),
          },
        },
      });
  
      // Create an interaction
      await prisma.interaction.create({
        data: {
          userId: parseInt(userId),
          articleId: parseInt(articleId),
          liked: true,
        },
      });
  
      res.status(200).json({ message: 'Article liked successfully!' });
    } catch (error) {
      console.error('Error liking article:', error);
      res.status(500).json({ error: 'Error liking article' });
    }
  });
  

// Save an article
app.post('/api/articles/:articleId/save', async (req, res) => {
  const { articleId } = req.params;
  const { userId } = req.body;

  try {
    // Update the saves count in the Article model
    await prisma.article.update({
      where: { id: parseInt(articleId) },
      data: {
        saves: {
          increment: 1,
        },
      },
    });

    // Update the saved articles in the User model
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        saved: {
          push: parseInt(articleId),
        },
      },
    });

    // Create an interaction
    await prisma.interaction.create({
      data: {
        userId: parseInt(userId),
        articleId: parseInt(articleId),
        saved: true,
      },
    });

    res.status(200).json({ message: 'Article saved successfully!' });
  } catch (error) {
    console.error('Error saving article:', error);
    res.status(500).json({ error: 'Error saving article' });
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






// stuff for recommended algorithm: 

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


// fetch and cache articles based on the topics in this frequency dictionary
const fetchAndCacheArticlesByTopics = async (topics, limit = 3) => {
const apiKey = process.env.NEWS_API_KEY;
const articles = [];

for (const topic of topics) {
  console.log(topic);
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
      await prisma.article.upsert({
        where: { title: article.title },
        update: {},
        create: {
          title: article.title,
          description: article.description || "no description available",
          author: article.creator || [],
          url: article.link,
          keywords: article.keywords || [],
          publishedAt: new Date(article.pubDate || Date.now()),
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
cron.schedule('*/30 * * * *', async () => {
  await fetchAndStoreArticles();

  const preferredTopics = await getAllPreferredTopics();
  const frequencyDict = generateFrequencyDictionary(preferredTopics);
  const sortedTopics = Object.keys(frequencyDict).sort((a, b) => frequencyDict[b] - frequencyDict[a]);
  const topNTopics = sortedTopics.slice(0, 5);
  await fetchAndCacheArticlesByTopics(topNTopics);
});

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


// calculate a similarity score between 2 users based on common likes, saves and preferredTopics
const calculateUserSimilarity = (user1, user2) => {
  const commonLikes = user1.liked.filter(articleId => user2.liked.includes(articleId));
  const commonSaves = user1.saved.filter(articleId => user2.saved.includes(articleId));
  const commonSaveToLike = user1.saved.filter(articleId => user2.liked.includes(articleId));
  const commonLikeToSave = user1.liked.filter(articleId => user2.saved.includes(articleId));
  const commonTopics = user1.preferredTopics.filter(topic => user2.preferredTopics.includes(topic));

  const weight1 = 3; // Weight for common likes - middle weight because liked is more relevant than topics chosen when setting up profile
  const weight2 = 4; // Weight for common saves - most weight because saved holds gravity
  const weight3 = 1; // Weight for common topics - least wegiht because initial interests (can be changed but matters less than the articles)
  const weight4 = 2; 
  const weight5 = 2; 

  const similarityScore = (weight1 * commonLikes.length) + (weight2 * commonSaves.length) + (weight3 * commonTopics.length) + (weight4 * commonLikeToSave.length) + (weight5 * commonSaveToLike.length);
  console.log(similarityScore); 

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
      take: 200
     });

    const similarUsers = findSimilarUsers(targetUser, allUsers, similarityThreshold);
    const recommendedArticles = recommendArticles(targetUser, similarUsers, allArticles);

    res.json(recommendedArticles);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Error generating recommendations' });
  }

});









// PULSECHECK stuff
// async function getGroqChatCompletion(userInput) {
//   return groq.chat.completions.create({
//     messages: [
//       {
//         role: "user",
//         content: "Explain the importance of fast language models",
//       },
//     ],
//     model: "llama3-8b-8192",
//   });
// }


// async function getLlamaResponse() {
//   const chatCompletion = await getGroqChatCompletion();
//   // Print the completion returned by the LLM.
//   console.log(chatCompletion.choices[0]?.message?.content || "");
// }




// const endpoint = 'https://api.groq.com/openai/v1/completions';
// const headers = {
//   'Authorization': `Bearer ${groqApiKey}`,
//   'Content-Type': 'application/json'
// };


// const requestBody = {
//   'prompt': 'Your input prompt here', // replace with your input prompt
//   'max_tokens': 200,
//   'model': modelId
// };


// axios.post(endpoint, requestBody, { headers: headers })
//   .then(response => {
//     console.log(response.data);
//   })
//   .catch(error => {
//     console.error(error);
//   });


// const fetchLlamaResponse = () => {
//   const groqApiKey = process.env.GROQ_API_KEY
//   const modelId = 'llama3-8b-8192';

//   const endpoint = 'https://api.groq.com/openai/v1/completions';
//   const headers = {
//     'Authorization': `Bearer ${groqApiKey}`,
//     'Content-Type': 'application/json'
//   };

//   const requestBody = {
//     'prompt': 'Your input prompt here', // replace with your input prompt
//     'max_tokens': 200,
//     'model': modelId
//   };

//   axios.post(endpoint, requestBody, { headers: headers })
//   .then(response => {
//     console.log(response.data);
//   })
//   .catch(error => {
//     console.error(error);
//   });

// }



// app.post(`/llama3-pulsecheck`, async (req, res) => {
//   const userInput = req.body.prompt;
// })







