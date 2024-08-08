import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {handleArticleClick} from '../utils/utils';
import {truncateText} from '../utils/textUtils';
import ArticleBoard from './ArticleBoard';
import NavBar from './NavBar';

import axios from 'axios';

const PulseCheckArticles = ({
  user,
  setClickedArticle,
  setViewInteracted,
  question,
  questionKeywords,
}) => {
  const navigate = useNavigate();
  const [pulseCheckArticles, setPulseCheckArticles] = useState([]);

  useEffect(() => {
    // Function to fetch articles related to pulseCheck suggestion
    const fetchPulseCheckArticles = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_BACKEND_URL + '/api/pulsecheck/articles',
          {
            params: {
              pulseCheckKeywords: questionKeywords,
            },
          },
        );
        setPulseCheckArticles(response.data || []);
      } catch (error) {
        console.error('error fetching pulsecheck articles:', error);
      }
    };

    fetchPulseCheckArticles();
  }, [question, questionKeywords]);

  const updateLastAsked = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/update/${user.id}/update-last-asked`, 
        {
          lastAsked: question, 
          lastAskedKeywords: questionKeywords,
        }
      )
    } catch (error) {
      console.error('Error updating last read question and keywords')
    }
  }

  updateLastAsked();

  return (
    <>
      <NavBar user={user} setViewInteracted={setViewInteracted} />
      <div className="pulsating-gradient"></div>
      <h1 className="text-3xl font-bold text-center text-white">
        ON THE PULSE:
      </h1>
      <p className="text-center text-white mb-10 mt-4">
        answering your question, "{question}"
      </p>

      {pulseCheckArticles.length > 0 && (
        <ArticleBoard
          user={user}
          setClickedArticle={setClickedArticle}
          setViewInteracted={setViewInteracted}
          articleList={pulseCheckArticles}
        />
      )}
    </>
  );
};

export default PulseCheckArticles;
