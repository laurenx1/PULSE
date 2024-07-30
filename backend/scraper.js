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
      if (currentText.trim()) {
        // Add text content before the tag
        if (currentTag === 'p') {
          paragraphs.push(currentText);
        }
        currentText = '';
      }
      currentTag = '';
    } else if (char === '>') {
      inTag = false;
      // Check for closing tag
      if (currentTag.startsWith('/')) {
        currentTag = currentTag.slice(1); // Remove '/'
      }
    } else if (inTag) {
      currentTag += char;
    } else {
      if (currentTag === 'p') {
        currentText += char;
      }
    }
  }

  // Add the last segment if it was within <p> tags
  if (currentText.trim() && currentTag === 'p') {
    paragraphs.push(currentText);
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
  let result = '';
  let inWhitespace = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
      if (!inWhitespace) {
        result += ' ';
        inWhitespace = true;
      }
    } else {
      result += char;
      inWhitespace = false;
    }
  }

  return result.trim();
};

/**
 * Replace special characters in the text.
 * @param {string} text - The text with special characters.
 * @returns {string} - The text with special characters replaced.
 * TODO - error where it is replacing apostrophes with &#8217, &#8211
 */
const replaceSpecialChars = text => {
  return text.replace(/’/g, "'");
};

/**
 * Remove non-ASCII characters from the text.
 * @param {string} text - The text with potential non-ASCII characters.
 * @returns {string} - The text with non-ASCII characters removed.
 */
const removeNonASCII = text => {
  return text.replace(/[^\x00-\x7F]+/g, ' ');
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
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
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

module.exports = {scrapeArticle};
