const axios = require('axios');
const { JSDOM } = require('jsdom');

/**
 * Cleans and formats the text content by removing extra whitespaces, special characters, and non-ASCII characters.
 * @param {string} content - The raw HTML content.
 * @returns {string[]} - An array of cleaned and formatted text segments.
 */
const cleanText = (content) => {
    const dom = new JSDOM(content);
    const paragraphs = dom.window.document.querySelectorAll('p');

    return Array.from(paragraphs).map(paragraph => {
        let text = paragraph.textContent;

        // Normalize whitespace and replace special characters
        text = text.replace(/\s+/g, ' ').trim();
        text = text.replace(/’/g, "'");
        text = text.replace(/[^\x00-\x7F]+/g, ' ');

        // Split text into sentences and format
        return text.split('.').filter(Boolean).join('.\n\n');
    });
};

/**
 * Scrapes and cleans the article content from a given URL.
 * @param {string} url - The URL of the article to scrape.
 * @returns {Promise<string[]>} - A promise that resolves to an array of cleaned text segments.
 */
const scrapeArticle = async (url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000 // Timeout after 10 seconds
        });

        const content = response.data;
        return cleanText(content); // Clean and format content
    } catch (error) {
        console.error(`Error scraping article from ${url}:`, error.message);
        return [`Error: ${error.message}`];
    }
};

module.exports = { scrapeArticle };
