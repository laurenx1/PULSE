import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';

const Interacted = ({ user, viewInteracted, setViewInteracted }) => {
    const navigate = useNavigate();
    const [contentType, setContentType] = useState('');
    const [displayedContent, setDisplayedContent] = useState([]);
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        const fetchArticles = async () => {
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

        const word = () => {
            if (viewInteracted === 'liked') {
                setContentType('liked');
                setDisplayedContent(user.liked);
                fetchArticles();
            } else if (viewInteracted === 'saved') {
                setContentType('saved');
                setDisplayedContent(user.saved);
                fetchArticles();
            } else {
                setContentType('');
                setArticles([]);
            }
        };
        word();
    }, [viewInteracted, user.id]);

    return (
        <div>
            <NavBar user={user} setViewInteracted={setViewInteracted}/>
            <h3>Here are your {contentType} articles!</h3>
            <ul>
                {articles.map((article) => (
                    <li key={article.id}>
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                            {article.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Interacted;
