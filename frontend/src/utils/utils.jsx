import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import {truncateText} from './textUtils';

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
    await axios.patch(import.meta.env.VITE_BACKEND_URL + `/update/users/${user.id}`, {
      lastRead: article,
    });
  } catch (error) {
    console.error('Error updating last read article:', error);
  }
  setClickedArticle(article);
  navigate(`/openArticle`); // open the article
};
