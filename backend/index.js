const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const { OAuth2Client } = require('google-auth-library');
const cron = require('node-cron');
const axios = require('axios');
const Replicate = require("replicate");



const prisma = new PrismaClient();
const app = express();
const PORT = 3000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const replicate = new Replicate(); 

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
  
  // Schedule the fetch and store task to run every 30 minutes
  // cron.schedule('*/30 * * * *', fetchAndStoreArticles);

  // fetchAndStoreArticles();


app.get('/api/articles', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Error fetching articles' });
  }
});



app.post('/api/detect-ai-content-hf', async (req, res) => {
  const { text } = req.body;
  const hfApiKey = process.env.HF_API_KEY;

  try {
      const response = await axios.post(
          "https://api-inference.huggingface.co/models/openai-community/roberta-base-openai-detector",
          { inputs: text },
          {
              headers: {
                  'Authorization': `Bearer ${hfApiKey}`,
                  'Content-Type': 'application/json',
              },
          }
      );
      console.log(res.json(response.data));
  } catch (error) {
      console.error('Error detecting AI content: ', error);
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




// stuff for recommended algorithm: 

// fetch preferred topics across all users
const getAllPreferredTopics = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        preferredTopics: true,
      },
    });

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
const fetchAndCacheArticlesByTopics = async (topics, limit = 10) => {
const apiKey = process.env.NEWS_API_KEY;
const articles = [];

for (const topic of topics) {
  console.log(topic);
  try {
    const response = await axios.get('https://newsdata.io/api/1/news', {
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
        where: { url: article.link },
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