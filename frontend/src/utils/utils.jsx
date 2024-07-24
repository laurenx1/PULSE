import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Function to truncate text to wordLimit number of words. 
export const truncateText = (text, wordLimit) => {
    if (!text) return 'No text available';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;

    // 50 means that the text is most likely a description to be truncated, should include the ... at the end for styling
    if (wordLimit === 50) {
        return `${words.slice(0, wordLimit).join(' ')}...`;
    }
    return words.slice(0, wordLimit).join(' ');
};


// Function to call backend to retrieve AI-generated content scores for the opened article
// @TODO: Add loading states to this 
export const handleDetection = async (content, setReal, setFake, articleId) => {
    if (!content || !articleId) {
        console.warn('No content or articleId provided for detection.');
        return;
    }
    try {
        const cleanedContent = content.replace(/\n/g, ' '); 
        const truncatedContent = truncateText(cleanedContent, 310); // truncate to 310 words to match tensors of the model 

        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/detect-ai-content-hf`, { content: truncatedContent, articleId });
        const { realScore, fakeScore } = response.data;

        // only 4 sig figs
        setReal((realScore * 100).toFixed(4));
        setFake((fakeScore * 100).toFixed(4));
    } catch (error) {
        console.error('Error detecting AI content:', error);
    }
}


// Function to fetch article content 
export const fetchArticleContent = async (setContent, article, setError, setLoading) => {
    try {
        setContent(article.content);
    } catch (error) {
        console.error('Error fetching the article', error);
        setError('Error fetching the article');
    } finally {
        setLoading(false);
    }
  
};


// Function to open the article that the user clicks on
export const handleArticleClick = async (user, article, setClickedArticle, navigate) => {
    try {
        await axios.patch(import.meta.env.VITE_BACKEND_URL + `/api/users/${user.id}`, { lastRead: article });
    } catch (error) {
        console.error('Error updating last read article:', error);
    }
    setClickedArticle(article);
    navigate(`/openArticle`); // open the article
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


    const tokenizeArray = (stringArray) => {
        return stringArray.flatMap(sentence => sentence.split(' '));
      };

    const processedWordArray = tokenizeArray(slightlyProcessedWordArray);

    return processedWordArray; 
}





