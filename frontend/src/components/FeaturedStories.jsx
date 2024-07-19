import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Helper function to truncate text to a maximum of 50 words
const truncateDescription = (description, wordLimit = 50) => {
    if (!description) return 'No description available';
    
    const words = description.split(' ');
    if (words.length <= wordLimit) return description;

    return `${words.slice(0, wordLimit).join(' ')}...`;
};

const FeaturedStories = ({ user, setClickedArticle }) => {
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
                console.log(topStories);
            } catch (error) {
                console.error('Error fetching top stories:', error);
            }
        };

        // Function to fetch related stories
        const fetchRelatedStories = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_BACKEND_URL + `/api/recommendations/${user.id}`);
                setRelatedStories((response.data || []).filter(story => story !== null));
                console.log(relatedStories);
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

    const handleArticleClick = async (article) => {
        try {
            await axios.patch(import.meta.env.VITE_BACKEND_URL + `/api/users/${user.id}`, { lastRead: article });
        } catch (error) {
            console.error('Error updating last read article:', error);
        }
        setClickedArticle(article);
        navigate(`/openArticle`); // open the article
    };

    const handleGoFeatured = () => {
        console.log(user.lastRead);
        navigate(`/${user.id}/featured`);
    };

    const handleGoPulseCheck = () => {
        navigate(`/${user.id}/pulsecheck`);
    }

    const handleViewLiked = () => {
        setViewInteracted('liked');
        navigate(`/${user.id}/seeYourContent`)
    }

    const handleViewSaved = () => {
        setViewInteracted('saved');
        navigate(`/${user.id}/seeYourContent`)
    }

    const firstArticle = topStories.length > 0 ? topStories[0] : null;
    const otherArticles = topStories.length > 1 ? topStories.slice(1) : [];
    const allArticles = [...otherArticles, ...relatedStories]; 

    return (
        <div className="p-6 bg-black text-white space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-center">FEATURED STORIES</h1>
                <p className="text-center">Your breaking news.</p>
                <nav className="space-x-1">
                    <button className="btn text-primary" onClick={handleViewLiked}>♥</button>
                    <button className="btn text-secondary" onClick={handleViewSaved}>★</button>
                    <button className="btn text-white" onClick={handleGoFeatured}>Featured Stories</button>
                    <button className="btn text-white" onClick={handleGoPulseCheck}>PULSECHECK</button>
                    <button className="btn text-white">About Us</button>
                </nav>
            </header>
            {user.lastRead && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-pink-500 text-white text-center z-50">
                    <span>You were reading "{user.lastRead.title}". </span>
                    <button
                        onClick={() => handleArticleClick(user.lastRead)}
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
                        onClick={() => handleArticleClick(firstArticle)}
                    >
                        <div className="flex justify-between">
                            <div>
                                <p className="text-lg font-bold">KEYWORDS: {firstArticle.keywords.join(', ')}</p>
                                <h2 className="text-3xl font-bold">{firstArticle.title}</h2>
                                <p>{truncateDescription(firstArticle.description)}</p>
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
                            onClick={() => handleArticleClick(article)}
                        >
                            <h3 className="text-xl font-bold">{article.title}</h3>
                            <p className="text-green-500">{article.realScore.toFixed(4) * 100}% Real Content Score</p>
                            <p>{article.author.join(', ')}</p>
                            <p>{truncateDescription(article.description)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturedStories;





