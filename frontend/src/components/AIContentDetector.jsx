import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIContentDetector = ({ articleId, content, setReal, setFake }) => {
    const truncateText = (text, wordLimit) => {
        const words = text.split(' ');
        return words.slice(0, wordLimit).join(' ');
    };

    const handleDetection = async () => {
        if (!content || !articleId) {
            console.warn('No content or articleId provided for detection.');
            return;
        }

        try {
            const cleanedContent = content.replace(/\n/g, ' ');
            const truncatedContent = truncateText(cleanedContent, 310);
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/detect-ai-content-hf`, { content: truncatedContent, articleId });

            const { realScore, fakeScore } = response.data;

            setReal((realScore * 100).toFixed(4));
            setFake((fakeScore * 100).toFixed(4));

        } catch (error) {
            console.error('Error detecting AI content:', error);
        }
    }

    useEffect(() => {
        handleDetection();
    }, [content, articleId]);  // Only re-run the effect if content or articleId changes

    return (
        <>
        </>
    );
};

export default AIContentDetector;

