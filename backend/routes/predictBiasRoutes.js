const express = require('express');
const router = express.Router();
const { predict } = require('../utils/predictBias')

router.post('/predict', async (req, res) => {
    const { text } = req.body;
  
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
  
    try {
      const prediction = await predict(text);
      res.json({ prediction });
    } catch (error) {
      res.status(500).json({ error: 'Error predicting' });
    }
  });
  
  module.exports = router;
