// test-api.js
const axios = require('axios');
const {predict} = require('./utils/bias');

// Define the API endpoint
const apiUrl = 'http://127.0.0.1:5000/predict';

// Define the test data
const testData = {
  text: 'Donald trump belongs in jail.',
};

// Make a POST request to the API
predict(testData.text);
