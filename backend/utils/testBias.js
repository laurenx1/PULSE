// test-api.js
const axios = require('axios');
const {predict} = require('./predictBias');

// Define the API endpoint
const apiUrl = 'http://127.0.0.1:5000/predict';

// Define the test data
const testData = {
  text: 'I sell stuff.',
};

// Make a POST request to the API
predict(testData.text);
