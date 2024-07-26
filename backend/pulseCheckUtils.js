const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const fetchPulseCheckArticles = async (keywords) => {
    // Convert keywords to lowercase for case-insensitive matching
    const lowercaseKeywords = keywords.map(keyword => keyword.toLowerCase());
  
    let articles = [];
  
    // Query the database for articles matching all keywords first, then fewer keywords
    for (let i = keywords.length; i > 0; i--) {
        const combinations = getCombinations(lowercaseKeywords, i);
        for (const combination of combinations) {
            const keywordQuery = combination.map(keyword => ({
                keywords: {
                    has: keyword
                }
            }));
  
            const matchingArticles = await prisma.article.findMany({
                where: {
                    AND: keywordQuery
                },
                take: 16 - articles.length
            });
  
            articles.push(...matchingArticles);
  
            // If we have reached 16 articles, return
            if (articles.length >= 16) {
                return articles.slice(0, 16);
            }
        }
    }
  
    return articles.slice(0, 16);
  };
  
  // Helper function to get combinations of array elements
  const getCombinations = (array, size) => {
    if (size === 1) return array.map(d => [d]);
    let result = [];
    array.forEach((d, i) => {
        const smallerCombos = getCombinations(array.slice(i + 1), size - 1);
        smallerCombos.forEach(combo => {
            result.push([d, ...combo]);
        });
    });
    return result;
  };


  module.exports = { getCombinations, fetchPulseCheckArticles};