import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import { handleArticleClick } from '../utils/utils';
import { truncateText } from '../utils/textUtils';


const LikedSavedList = ({ user, viewInteracted, setViewInteracted, setClickedArticle }) => {
    const navigate = useNavigate();
    const [contentType, setContentType] = useState('');
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        const fetchInteractedArticles = async () => {
            if (user.id) {
                try {
                    const response = await axios.get(import.meta.env.VITE_BACKEND_URL + '/api/interactedArticles', {
                        params: {
                            type: viewInteracted,
                            userId: user.id,
                        },
                    });
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
        <div>
            <NavBar user={user} setViewInteracted={setViewInteracted}/>
            <h1 className="text-3xl font-bold text-center text-white mb-20">Your {contentType} articles</h1>
        </div>
        <div className="grid grid-cols-4 gap-6 ml-6 mr-6">
            {articles.map((article, index) => (
                <div
                    key={index}
                    className="bg-neutral p-4 rounded-lg text-white cursor-pointer hover:bg-gray-800"
                    onClick={() => handleArticleClick(user, article, setClickedArticle, navigate)}
                >
                    <h3 className="text-xl font-bold">{truncateText(article.title, 15)}</h3>
                    <p className="text-success">{article.realScore === 0 ? "NO SCORE CALCULATED" : (article.realScore * 100).toFixed(4) + "% Real Content Score"}</p>
                    <p>{article.author.join(', ')}</p>
                    <p>{truncateText(article.description, 30)}</p>
                </div>
            ))}
        </div>
        </>
    );
};

export default LikedSavedList;