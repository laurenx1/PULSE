import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FeaturedStories = ({ user }) => {
    const apiKey = import.meta.env.VITE_NEWSDATA_API_KEY;
    const [topStories, setTopStories] = useState([]);
    const [relatedStories, setRelatedStories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopStories = async () => {
            try {
                const response = await axios.get(`https://newsdata.io/api/1/latest?`, {
                    params: {
                        apikey: apiKey,
                        q: `breaking`,
                        country: 'us',
                    }
                });
                setTopStories(response.data.results || []);
            } catch (error) {
                console.log(apiKey);
                console.error('Error fetching top stories:', error);
            }
        };


        const fetchRelatedStories = async () => {
            try {
                const topicsQuery = user.preferredTopics.map(topic => topic).join(' ');
                console.log('hello');
                console.log(topicsQuery);
                const response = await axios.get(`https://newsdata.io/api/1/latest?`, {
                    params: {
                        apikey: apiKey,
                        q: topicsQuery,
                        country: 'us',
                        language: 'en',

                    }
                });
                setRelatedStories(response.data.results || []);
            } catch (error) {
                console.error('Error fetching related stories:', error);
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
        // Navigate to the article URL when clicked
        // navigate(article.link);
        try {
            await axios.patch( import.meta.env.VITE_BACKEND_URL + `/api/users/${user.id}`, { lastRead: article });
            // alert('Preferred topics updated successfully!');
        } catch (error) {
            console.error('Error updating last read article:', error);
        }
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-md space-y-6">
            <h1 className="text-3xl font-bold text-center text-gray-800">Welcome to your daily Featured Stories page!</h1>

            <div>
                <h2 className="text-2xl font-bold text-gray-800">Top 10 News Articles of the Day</h2>
                <ul className="space-y-3">
                    {topStories.map((article, index) => (
                        <li key={index} className="text-blue-600 hover:text-blue-700">
                            <a href={article.link} target="_blank" rel="noopener noreferrer" onClick={() => handleArticleClick(article)}>
                                {article.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-800">Articles Related to Your Preferred Topics</h2>
                <ul className="space-y-3">
                    {relatedStories.map((article, index) => (
                        <li key={index} className="text-blue-600 hover:text-blue-700">
                            <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={() => handleArticleClick(article)}>
                                {article.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FeaturedStories;

