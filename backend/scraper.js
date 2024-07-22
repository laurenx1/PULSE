const axios = require('axios');
const { JSDOM } = require('jsdom');

// Function to clean and format text content
const cleanText = (content) => {
    const dom = new JSDOM(content);
    const paragraphs = dom.window.document.querySelectorAll('p');

    const textArray = Array.from(paragraphs).map(para => {
        let text = para.textContent;
        text = text.replace(/\s+/g, ' '); // replace multiple whitespaces with one
        text = text.replace(/’/g, "'"); // replace special character
        text = text.replace(/[^\x00-\x7F]+/g, ' '); // remove non-ASCII characters
        const sentences = text.split('.').filter(sentence => sentence.length > 0);
        return sentences.join('.\n\n');
    });

    return textArray;
};

// Function to scrape and clean article content
const scrapeArticle = async (url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000 // Timeout after 10 seconds
        });

        const content = response.data;
        const formattedContent = cleanText(content); // Clean and format content

        return formattedContent;
    } catch (error) {
        console.error('Error scraping article:', error);
        return [`Error: ${error.message}`];
    }
};

module.exports = { scrapeArticle };
