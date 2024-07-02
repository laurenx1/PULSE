const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');


const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


app.patch('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { preferredTopics } = req.body;
  
    try {
      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { preferredTopics },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).send({ message: 'Preferred topics updated successfully!', user });
    } catch (error) {
      console.error('Error updating preferred topics:', error);
      res.status(500).send({ error: 'Failed to update preferred topics.' });
    }
  });

