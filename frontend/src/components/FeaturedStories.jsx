import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import { handleArticleClick } from '../utils/utils';
import { truncateText } from '../utils/textUtils';
import ArticleBoard from './ArticleBoard';


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
                <div className="fixed bottom-4 right-4 p-2 bg-gradient-to-r from-[#1E90FF] to-[#00FA9A] text-white text-center z-50 rounded-full shadow-lg flex items-center space-x-2">
                <span>You were reading "{user.lastRead.title}". </span>
                <button
                    onClick={() => handleArticleClick(user, user.lastRead, setClickedArticle, navigate)}
                    className="underline hover:text-gray-300 transition whitespace-nowrap"
                >
                    Continue Reading?
                </button>
            </div>
            )}

            <div className="space-y-6">
                {firstArticle && (
                    <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 rounded-lg cursor-pointer hover:opacity-60 "
                        onClick={() => handleArticleClick(user, firstArticle, setClickedArticle, navigate)}
                    >
                        <div className="flex justify-between">
                            <div>
                                <h2 className="text-3xl font-bold">{firstArticle.title}</h2>
                                <p>{truncateText(firstArticle.description, 50)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-success">{firstArticle.realScore.toFixed(4) * 100}% Real Content Score</p>
                            </div>
                        </div>
                    </div>
                )}

                {allArticles.length > 0 && <ArticleBoard user={user} setClickedArticle={setClickedArticle} setViewInteracted={setViewInteracted} articleList={allArticles}/>}
            </div>
        </div>
    );
};

export default FeaturedStories;





