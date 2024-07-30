// api.js
const axios = require('axios');

const predict = async text => {
  try {
    const response = await axios.post('http://127.0.0.1:5000/predict', {text});
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error predicting:', error);
    return [];
  }
};

module.exports = {predict};
