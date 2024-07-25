const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @route PATCH /api/users/:id
 * @description Update a user's preferred topics and last read article
 * @param {string} id - User ID
 * @param {Array} preferredTopics - Array of preferred topics
 * @param {Object} lastRead - Last read article information
 * @returns {Object} Updated user information
 */
router.patch('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { preferredTopics, lastRead } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        const data = {};

        if (preferredTopics !== undefined) {
            if (!Array.isArray(preferredTopics)) {
                return res.status(400).json({ error: 'preferredTopics should be an array' });
            }
            data.preferredTopics = preferredTopics;
        }

        if (lastRead !== undefined) {
            data.lastRead = lastRead;
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data,
        });

        res.status(200).json({ message: 'User updated successfully!', user });
    } catch (error) {
        console.error('Error updating user:', error);

        if (error.code === 'P2025') { // Prisma specific error code for record not found
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(500).json({ error: 'Failed to update user.' });
    }
});


/**
 * @route POST /api/articles/:articleId/like
 * @description Like an article
 * @param {string} articleId - Article ID
 * @param {string} userId - User ID
 * @returns {Object} Success message
 */
router.post('/articles/:articleId/like', async (req, res) => {
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

/**
 * @route POST /api/articles/:articleId/save
 * @description Save an article
 * @param {string} articleId - Article ID
 * @param {string} userId - User ID
 * @returns {Object} Success message
 */
router.post('/articles/:articleId/save', async (req, res) => {
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

module.exports = router;