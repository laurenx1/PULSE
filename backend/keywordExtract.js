const express = require('express');
const natural = require('natural');
const stopword = require('stopword');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const tokenizer = new natural.WordTokenizer();

// keyword sweep to populate Article s.t. every article has keywords extracted
// extract keywords from a title
const extractKeywords = (title, numKeywords=5) => {
    const wordCount = {};
    const words = tokenizer.tokenize(title.toLowerCase()); // convert to lowercase, tokenize into individual words
    const filteredWords = stopword.removeStopwords(words); // remove common stop words (and, the, etc.)
  
    filteredWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1; 
    });
  
    const sortedWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .map(([word]) => word);
  
      return sortedWords.slice(0, numKeywords); // return the top numKeywords words from the sorted list.
  };
  
  
// sweep through articles, fill in keywords field for articles with none. 
async function updateArticleKeywords() {
try {
    // Fetch all articles
    const articles = await prisma.article.findMany();

    for (const article of articles) {
        // Check if the keywords array is empty
        if (article.keywords.length === 0) {
            // Extract keywords from the title
            const keywords = extractKeywords(article.title);
            // Update the article with the new keywords
            await prisma.article.update({
                where: { id: article.id },
                data: { keywords },
            });
        }
    }
} catch (error) {
    console.error('Error updating keywords:', error);
} 
}; 


module.exports = { updateArticleKeywords };

  