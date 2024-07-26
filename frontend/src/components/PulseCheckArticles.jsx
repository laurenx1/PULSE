import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleArticleClick } from '../utils/utils';
import { truncateText } from '../utils/textUtils';

import axios from 'axios';

const PulseCheckArticles = ({ user, setClickedArticle, setViewInteracted, question, questionKeywords }) => {
    const navigate = useNavigate();
    const [pulseCheckArticles, setPulseCheckArticles] = useState([]); 

    useEffect(() => {
        // Function to fetch articles related to pulseCheck suggestion
        const fetchPulseCheckArticles = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_BACKEND_URL + '/pulsecheck/articles', {
                    params: {
                        pulseCheckKeywords: questionKeywords
                    }
                });
                setPulseCheckArticles(response.data || []);
            } catch (error) {
                console.error('error fetching pulsecheck articles:', error);
            }
        };


        fetchPulseCheckArticles();
    }, [question, questionKeywords]);


    return (
        <>
        <h1>welcome to your articles on: {question}</h1>
        <div className="grid grid-cols-4 gap-4">
                    {pulseCheckArticles.map((article, index) => (
                        <div
                            key={index}
                            className="bg-neutral p-4 rounded-lg text-white cursor-pointer hover:bg-gray-800 hover:scale-105 transition-transform"
                            onClick={() => handleArticleClick(user, article, setClickedArticle, navigate)}
                        >
                            <h3 className="text-xl font-bold">{article.title}</h3>
                            <p className="text-success">{article.realScore === 0 ? "NO SCORE CALCULATED" : (article.realScore * 100).toFixed(4) + "% Real Content Score"}</p>
                            <p className="text-pink-500">{article.author.join(', ')}</p>
                            <p>{truncateText(article.description, 30)}</p>
                        </div>
                    ))}
                </div>
        </>
    );
};

export default PulseCheckArticles;