import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import { truncateText, handleArticleClick } from '../utils/utils';


const FeaturedStories = ({ user, setClickedArticle, setViewInteracted }) => {
    const apiKey = import.meta.env.VITE_NEWSDATA_API_KEY;
    const [topStories, setTopStories] = useState([]);
    const [relatedStories, setRelatedStories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Function to fetch top stories
        const fetchTopStories = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_BACKEND_URL + '/api/articles');
                setTopStories(response.data || []);
            } catch (error) {
                console.error('Error fetching top stories:', error);
            }
        };

        // Function to fetch related stories
        const fetchRelatedStories = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_BACKEND_URL + `/api/recommendations/${user.id}`);
                setRelatedStories((response.data || []).filter(story => story !== null));
            } catch (error) {
                console.error('Error fetching recommended stories:', error);
            }
        };

        if (apiKey) {
            fetchTopStories();
            fetchRelatedStories();
        } else {
            console.error('API key is undefined');
        }
    }, [apiKey, user.preferredTopics]);


    const firstArticle = topStories.length > 0 ? topStories[0] : null;
    const otherArticles = topStories.length > 1 ? topStories.slice(1) : [];
    const allArticles = [...otherArticles, ...relatedStories]; 

    return (
        <div className="p-6 bg-black text-white space-y-6">
            <header>
                <NavBar user={user} setViewInteracted={setViewInteracted}/>
                <h1 className="text-3xl font-bold text-center">FEATURED STORIES</h1>
                <p className="text-center">Your breaking news.</p>
            </header>
            {user.lastRead && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-pink-500 text-white text-center z-50">
                    <span>You were reading "{user.lastRead.title}". </span>
                    <button
                        onClick={() => handleArticleClick(user, user.lastRead, setClickedArticle, navigate)}
                        className="underline hover:text-gray-300 transition"
                    >
                        Continue Reading?
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {firstArticle && (
                    <div
                        className="bg-gradient-to-r from-[#2E008E] via-[#98648B] to-[#FCC188] p-6 rounded-lg cursor-pointer hover:opacity-90 hover:scale-105 transition-transform"
                        onClick={() => handleArticleClick(user, firstArticle, setClickedArticle, navigate)}
                    >
                        <div className="flex justify-between">
                            <div>
                                <p className="text-lg font-bold">KEYWORDS: {firstArticle.keywords.join(', ')}</p>
                                <h2 className="text-3xl font-bold">{firstArticle.title}</h2>
                                <p>{truncateText(firstArticle.description, 50)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-green-500">{firstArticle.realScore.toFixed(4) * 100}% Real Content Score</p>
                                <p className="text-red-500">{firstArticle.fakeScore.toFixed(4) * 100}% AI Generated Content Score</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-4 gap-4">
                    {allArticles.map((article, index) => (
                        <div
                            key={index}
                            className="bg-black border border-white p-4 rounded-lg text-white cursor-pointer hover:bg-gray-800 hover:scale-105 transition-transform"
                            onClick={() => handleArticleClick(user, article, setClickedArticle, navigate)}
                        >
                            <h3 className="text-xl font-bold">{article.title}</h3>
                            <p className="text-green-500">{article.realScore.toFixed(4) * 100}% Real Content Score</p>
                            <p>{article.author.join(', ')}</p>
                            <p>{truncateText(article.description, 50)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturedStories;





