import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import {handleArticleClick} from '../utils/utils';
import {truncateText} from '../utils/textUtils';
import ArticleBoard from './ArticleBoard';

const TopicStories = ({
  user,
  viewInteracted,
  setViewInteracted,
  setClickedArticle,
  viewTopic
}) => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);


  useEffect(() => {
    const fetchTopicArticles = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_BACKEND_URL + '/api/pulsecheck/articles',
          {
            params: {
              pulseCheckKeywords: viewTopic,
            },
          },
        );
        setArticles(response.data || []);
      } catch (error) {
        console.error('error fetching pulsecheck articles:', error);
      }
    };

    fetchTopicArticles();

  }, [viewTopic]);

  return (
    <>
      <NavBar user={user} setViewInteracted={setViewInteracted} />
      <div>
        <h1 className="text-3xl font-bold text-center text-white mb-10">
          Your {viewTopic} articles
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

export default TopicStories;