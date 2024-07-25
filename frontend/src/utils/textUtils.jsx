/* textUtils.jsx */
/* text processing functions */

// Function to truncate text to wordLimit number of words. 
export const truncateText = (text, wordLimit) => {
    if (!text) return 'No text available';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;

    // 30 means that the text is most likely a description to be truncated, should include the ... at the end for styling
    if (wordLimit === 30) {
        return `${words.slice(0, wordLimit).join(' ')}...`;
    }
    return words.slice(0, wordLimit).join(' ');
};


// Function to remove stopwords from array, also tokenizes string array into single-word elemetns
export const removeStopwordsFromArray = (wordArray) => {
    const stopwords = [
        "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he", "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were", "will", "with", "change"
      ];
    
    const removeStopwordsFromPhrase = (text) => {
        return text
            .split(' ')
            .filter(word => !stopwords.includes(word.toLowerCase()))
            .join(' ');
    };

    const slightlyProcessedWordArray = wordArray.map(phrase => removeStopwordsFromPhrase(phrase));

    const processedWordArray = tokenizeArray(slightlyProcessedWordArray);

    return processedWordArray; 
}