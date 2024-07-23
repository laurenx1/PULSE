import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import { truncateText, handleArticleClick } from '../utils/utils';


const LikedSavedList = ({ user, viewInteracted, setViewInteracted, setClickedArticle }) => {
    const navigate = useNavigate();
    const [contentType, setContentType] = useState('');
    const [displayedContent, setDisplayedContent] = useState([]);
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

        const setInteractionType = () => {
            if (viewInteracted === 'liked') {
                setContentType('liked');
                setDisplayedContent(user.liked);
                fetchInteractedArticles();
            } else if (viewInteracted === 'saved') {
                setContentType('saved');
                setDisplayedContent(user.saved);
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
            <h1 className="text-3xl font-bold text-center mb-20">Here are your {contentType} articles!</h1>
        </div>
        <div className="grid grid-cols-4 gap-4">
            {articles.map((article, index) => (
                <div
                    key={index}
                    className="bg-gray-800 p-4 rounded-lg text-white cursor-pointer hover:bg-gray-800 hover:scale-105 transition-transform"
                    onClick={() => handleArticleClick(user, user.lastRead, setClickedArticle, navigate)}
                >
                    <h3 className="text-xl font-bold">{article.title}</h3>
                    <p className="text-green-500">{article.realScore.toFixed(4) * 100}% Real Content Score</p>
                    <p>{article.author.join(', ')}</p>
                    <p>{truncateText(article.description, 50)}</p>
                </div>
            ))}
        </div>
        </>
    );
};

export default LikedSavedList;