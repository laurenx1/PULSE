import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FeaturedStories = ({ user, setClickedArticle }) => {
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

        // Custom combination function
const getCombinations = (array, size) => {
    function* combinations(arr, size) {
        if (size === 1) {
            for (let i = 0; i < arr.length; i++) {
                yield [arr[i]];
            }
        } else {
            for (let i = 0; i <= arr.length - size; i++) {
                const head = arr.slice(i, i + 1);
                const tail = arr.slice(i + 1);
                for (const comb of combinations(tail, size - 1)) {
                    yield head.concat(comb);
                }
            }
        }
    }
    return Array.from(combinations(array, size));
};

// Delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simple in-memory cache
const cache = {};

// Function to fetch related stories
const fetchRelatedStories = async () => {
    try {
        const maxArticles = 10; // Number of articles to fetch
        let relatedStories = [];
        const topics = user.preferredTopics;
        const maxCombinations = 3; // Max topics in a combination
        const articleUrls = new Set(); // Track unique article URLs

        for (let i = Math.min(maxCombinations, topics.length); i > 0; i--) {
            const topicCombinations = getCombinations(topics, i);

            for (const combo of topicCombinations) {
                const topicsQuery = combo.join(' ');

                // Check cache first
                if (cache[topicsQuery]) {
                    cache[topicsQuery].forEach(article => {
                        if (!articleUrls.has(article.link)) {
                            articleUrls.add(article.link);
                            relatedStories.push(article);
                        }
                    });
                } else {
                    // Make API request if not in cache
                    const response = await axios.get('https://newsdata.io/api/1/latest?', {
                        params: {
                            apikey: apiKey,
                            q: topicsQuery,
                            country: 'us',
                            language: 'en',
                        }
                    });

                    const results = response.data.results || [];
                    cache[topicsQuery] = results; // Cache the results

                    results.forEach(article => {
                        if (!articleUrls.has(article.link)) {
                            articleUrls.add(article.link);
                            relatedStories.push(article);
                        }
                    });

                    // Delay to avoid hitting the rate limit
                    await delay(1000); // 1-second delay between requests
                }

                if (relatedStories.length >= maxArticles) {
                    setRelatedStories(relatedStories.slice(0, maxArticles));
                    return;
                }
            }
        }

        // If fewer than 10 articles are found, set whatever was found
        setRelatedStories(relatedStories);
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
        } catch (error) {
            console.error('Error updating last read article:', error);
        }
        setClickedArticle(article);
        navigate(`/openArticle`); // open the article
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


