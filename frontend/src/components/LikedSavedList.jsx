import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import {handleArticleClick} from '../utils/utils';
import {truncateText} from '../utils/textUtils';
import ArticleBoard from './ArticleBoard';

const LikedSavedList = ({
  user,
  viewInteracted,
  setViewInteracted,
  setClickedArticle,
}) => {
  const navigate = useNavigate();
  const [contentType, setContentType] = useState('');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchInteractedArticles = async () => {
      if (user.id) {
        try {
          const response = await axios.get(
            import.meta.env.VITE_BACKEND_URL + '/api/interactedArticles',
            {
              params: {
                type: viewInteracted,
                userId: user.id,
              },
            },
          );
          setArticles(response.data);
        } catch (error) {
          console.error('Error fetching articles:', error);
        }
      }
    };

    /**
     * LikedSavedList can be used to display either liked or saved content
     * @description: sets interaction type so backend recieves request for either liked
     * or saved content
     *  */
    const setInteractionType = () => {
      if (viewInteracted === 'liked') {
        setContentType('liked');
        fetchInteractedArticles();
      } else if (viewInteracted === 'saved') {
        setContentType('saved');
        fetchInteractedArticles();
      } else {
        setContentType('');
        setArticles([]);
      }
    };
    setInteractionType();
  }, [viewInteracted, user.id]);

  return (
    <>
      <NavBar user={user} setViewInteracted={setViewInteracted} />
      <div>
        <h1 className="text-3xl font-bold text-center text-white mb-10">
          Your {contentType} articles
        </h1>
      </div>
      {articles.length > 0 && (
        <ArticleBoard
          user={user}
          setClickedArticle={setClickedArticle}
          setViewInteracted={setViewInteracted}
          articleList={articles}
        />
      )}
    </>
  );
};

export default LikedSavedList;
