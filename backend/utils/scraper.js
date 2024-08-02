const axios = require('axios');

/**
 * Parses HTML content to extract text from <p> tags.
 * @param {string} html - The raw HTML content.
 * @returns {string[]} - An array of text extracted from <p> tags.
 */
const parseHTML = html => {
  const paragraphs = [];
  let inTag = false;
  let currentTag = '';
  let currentText = '';

  for (let i = 0; i < html.length; i++) {
    const char = html[i];

    if (char === '<') {
      inTag = true;
      if (currentText.trim() && currentTag === 'p') {
        // Add text content before the tag
        paragraphs.push(currentText.trim());
        currentText = '';
      }
      currentTag = '';
    } else if (char === '>') {
      inTag = false;
    } else if (inTag) {
      currentTag += char.toLowerCase();
    } else {
      currentText += char;
    }
  }

  // Add the last segment if it was within <p> tags
  if (currentText.trim() && currentTag === 'p') {
    paragraphs.push(currentText.trim());
  }

  return paragraphs;
};

/**
 * Cleans and formats the text content by removing extra whitespaces, special characters, and non-ASCII characters.
 * @param {string} content - The raw HTML content.
 * @returns {string[]} - An array of cleaned and formatted text segments.
 */
const cleanText = content => {
  const paragraphs = parseHTML(content);

  return paragraphs.map(paragraph => {
    let text = paragraph;

    // Normalize whitespace
    text = normalizeWhitespace(text);

    // Replace special characters
    text = replaceSpecialChars(text);

    // Remove non-ASCII characters
    text = removeNonASCII(text);

    // Split text into sentences and format
    return text.split('.').filter(Boolean).join('.\n\n');
  });
};

/**
 * Normalize whitespace in the text.
 * @param {string} text - The text to normalize.
 * @returns {string} - The normalized text.
 */
const normalizeWhitespace = text => {
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Replace special characters in the text.
 * @param {string} text - The text with special characters.
 * @returns {string} - The text with special characters replaced.
 */
const replaceSpecialChars = text => {
  const replacements = {
    '’': "'",
    '“': '"',
    '”': '"',
    '–': '-',
    '—': '-',
    '&nbsp;': ' ',
    '&amp;': '&',
    '&quot;': '"',
    '&lt;': '<',
    '&gt;': '>'
    // Add more replacements as needed
  };
  return text.replace(/’|“|”|–|—|&nbsp;|&amp;|&quot;|&lt;|&gt;/g, char => replacements[char] || char);
};

/**
 * Remove non-ASCII characters from the text.
 * @param {string} text - The text with potential non-ASCII characters.
 * @returns {string} - The text with non-ASCII characters removed.
 */
const removeNonASCII = text => {
  return text.replace(/[^\x00-\x7F]+/g, '');
};

/**
 * Scrapes and cleans the article content from a given URL.
 * @param {string} url - The URL of the article to scrape.
 * @returns {Promise<string[]>} - A promise that resolves to an array of cleaned text segments.
 */
const scrapeArticle = async url => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000, // Timeout after 10 seconds
    });

    const content = response.data;
    return cleanText(content); // Clean and format content
  } catch (error) {
    console.error(`Error scraping article from ${url}:`, error.message);
    return [`Error: ${error.message}`];
  }
};

module.exports = { scrapeArticle };

