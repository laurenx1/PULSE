import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArticleScrape from './ArticleScrape';

const Story = ({ user, clickedArticle }) => {
    const navigate = useNavigate();
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Check if the article has been liked or saved already
        setLiked(user.liked.includes(clickedArticle.id));
        setSaved(user.saved.includes(clickedArticle.id));
    }, [clickedArticle.id, user.liked, user.saved]);

    const handleGoFeatured = () => {
        navigate(`/${user.id}/featured`);
    };

    const handleLike = async () => {
        if (liked) return; // Prevent multiple likes
        try {
            await axios.post(import.meta.env.VITE_BACKEND_URL + `/api/articles/${clickedArticle.id}/like`, { userId: user.id });
            setLiked(true);
            console.log('You liked: ' + clickedArticle.title);
        } catch (error) {
            console.error('Error liking article:', error);
        }
    };

    const handleSave = async () => {
        if (saved) return; // Prevent multiple saves
        try {
            await axios.post(import.meta.env.VITE_BACKEND_URL + `/api/articles/${clickedArticle.id}/save`, { userId: user.id });
            setSaved(true);
            console.log('You saved: ' + clickedArticle.title);
        } catch (error) {
            console.error('Error saving article:', error);
        }
    };

    return (
        <>
            <div className="relative mb-20">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">PULSE</h1>
                    <nav className="space-x-1">
                        <button className="btn text-primary">♥</button>
                        <button className="btn text-secondary">★</button>
                        <button className="btn text-white" onClick={handleGoFeatured}>Featured Stories</button>
                        <button className="btn text-white">PULSECHECK</button>
                        <button className="btn text-white">About Us</button>
                    </nav>
                </header>

                <div className="absolute top-16 right-0 flex items-center space-x-2 mr-4 mb-4">
                    <button 
                        className={`btn ${liked ? 'btn-primary' : 'btn-outline btn-primary'}`} 
                        onClick={handleLike}
                    >
                        ♥
                    </button>
                    <button 
                        className={`btn ${saved ? 'btn-secondary' : 'btn-outline btn-secondary'}`} 
                        onClick={handleSave}
                    >
                        ★
                    </button>
                </div>
            </div>

            <ArticleScrape article={clickedArticle} />
        </>
    );
};

export default Story;
