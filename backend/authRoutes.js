// authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const {PrismaClient} = require('@prisma/client');
const {OAuth2Client} = require('google-auth-library');

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

/**
 * POST /register
 * Registers a new user by hashing their password and storing their information in the database.
 *
 * @route POST /register
 * @param {string} email - The email of the new user.
 * @param {string} username - The username of the new user.
 * @param {string} password - The plaintext password of the new user.
 * @returns {Object} 200 - The newly created user object.
 * @returns {Object} 500 - Internal server error message.
 */
router.post('/register', async (req, res) => {
  const {email, username, password} = req.body;

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
    res.json({success: true, user: newUser});
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({success: false, error: 'Error registering user'});
  }
});

/**
 * POST /login
 * Logs in an existing user by verifying their email and password.
 *
 * @route POST /login
 * @param {string} email - The email of the user attempting to log in.
 * @param {string} password - The plaintext password of the user.
 * @returns {Object} 200 - The logged-in user object.
 * @returns {Object} 401 - Invalid credentials error message.
 * @returns {Object} 404 - User not found error message.
 * @returns {Object} 500 - Internal server error message.
 */
router.post('/login', async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await prisma.user.findUnique({where: {email}});

    if (!user) {
      return res.status(404).json({success: false, error: 'User not found'});
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({success: false, error: 'Invalid credentials'});
    }

    res.json({success: true, user});
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({success: false, error: 'Error logging in'});
  }
});

/**
 * POST /google-login
 * Logs in a user with their Google account by verifying the provided token.
 * If the user does not exist in the database, a new user record is created.
 *
 * @route POST /google-login
 * @param {string} token - The ID token provided by Google.
 * @returns {Object} 200 - The logged-in or newly created user object.
 * @returns {Object} 500 - Internal server error message.
 */
router.post('/google-login', async (req, res) => {
  const {token} = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const {email, name, picture} = payload;

    let user = await prisma.user.findUnique({where: {email}});

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          username: name,
          picture,
        },
      });
    }

    res.json({success: true, user});
  } catch (error) {
    console.error('Error with Google login:', error);
    res.status(500).json({success: false, error: 'Error with Google login'});
  }
});

module.exports = router;
