// server.mjs
import express from 'express';
import bodyParser from 'body-parser';
import { loadModelAndTokenizer, predict } from './predict.mjs'; // Adjust the path as needed

const router = express.Router();

router.post('/predict', async (req, res) => {
    const { text } = req.body;

    try {
        const predictedLabelsWithPercentages = await predict(text);
        res.json(predictedLabelsWithPercentages);
    } catch (error) {
        console.error('Error during prediction:', error);
        res.status(500).send('Error during prediction');
    }
});

export const setupPredictionRoutes = async (app) => {
    await loadModelAndTokenizer(); // Ensure model and tokenizer are loaded
    app.use('/server', router); // Attach router to /api path
};
