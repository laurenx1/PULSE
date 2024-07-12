import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArticleScrape from './ArticleScrape';

const Story = ({ user, clickedArticle }) => {
    const navigate = useNavigate();

    const handleGoFeatured = () => {
        navigate(`/${user.id}/featured`);
    };

    const handleLike = async () => {
        try {
            await axios.post(`/api/articles/${clickedArticle.id}/like`, { userId: user.id });
            console.log('you liked:' + clickedArticle.title);
        } catch (error) {
            console.error('Error liking article:', error);
        }
    };

    const handleSave = async () => {
        try {
            await axios.post(`/api/articles/${clickedArticle.id}/save`, { userId: user.id });
            console.log('you saved:' + clickedArticle.title);
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
                    <button className="btn btn-outline btn-primary" onClick={handleLike}>♥</button>
                    <button className="btn btn-outline btn-secondary" onClick={handleSave}>★</button>
                </div>
            </div>

            <ArticleScrape article={clickedArticle}/>
        </>
    );
};

export default Story;