import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import Marquee from './Marquee';
import { truncateText, handleArticleClick } from '../utils/utils';

const UserProfile = ({ user, setViewInteracted, clickedArticle, setClickedArticle, topics}) => {
    const navigate = useNavigate();

    const { username, preferredTopics } = user;
    const selectedTopics = topics.length !== 0 ? topics : user.preferredTopics;

    /**
     * @description: lastRead article will always be the lastClicked article
     * clickedArticle has useState of null, so gets lastRead from user data when this occurs
     * which is on first render after sign in
     */
    const lastRead = clickedArticle || user.lastRead; 


    const handleSelectTopics = () => {
        navigate(`/${user.id}/topics`);
    };

    const handleLastRead = () => {
        console.log('going to last read article!');
        handleArticleClick(user, lastRead, setClickedArticle, navigate);
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-black min-h-screen">
            <NavBar user={user} setViewInteracted={setViewInteracted} />
            <div className="bg-black text-white rounded-lg shadow-md p-8">
                <div className="flex items-center mb-4">
                    <div className="rounded-full bg-gray-700 w-16 h-16"></div>
                    <h2 className="text-4xl font-bold ml-4">{username}'s Profile</h2>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 mb-8" onClick={handleLastRead}>
                    <h3 className="text-xl font-bold text-pink-500 mb-2">LAST READ</h3>
                    <h4 className="text-2xl font-bold mb-2">{lastRead.title}</h4>
                    <p className="text-green-400 mb-2">• No AI generated content</p>
                    <p className="text-white-400">{lastRead.creator}</p>
                    <p className="text-gray-400">{truncateText(lastRead.description, 50)}</p>
                </div>
                <div className="bg-gradient-to-r from-[#2E008E] via-[#7042D2] to-[#FCC188] rounded-lg p-4 mb-8">
                    <h3 className="text-lg font-bold mb-4">YOUR PULSE POINTS</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {selectedTopics.map(topic => (
                            <button key={topic} className="bg-black text-white p-4 rounded-lg text-center hover:opacity-50">{topic}</button>
                        ))}
                    </div>
                </div>
                <div className="flex space-x-4">
                    <button className="btn btn-primary bg-[#EB73CB] rounded-lg px-4 py-2" onClick={handleSelectTopics}>Edit your interests</button>
                    <button className="btn btn-primary bg-[#EB73CB] rounded-lg px-4 py-2">See updates on your most recently asked question</button>
                </div>
            </div>
            <Marquee user={user}/>
        </div>
    );
};

export default UserProfile;


