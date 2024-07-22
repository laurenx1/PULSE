import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ user, setViewInteracted}) => {
    const { username, preferredTopics } = user;
    const [topics, setTopics] = useState(preferredTopics);
    const lastRead = user.lastRead; 

    const navigate = useNavigate();

    useEffect(() => {
        setTopics(user.preferredTopics);
    }, [user.preferredTopics]); // Update useEffect to depend on preferredTopics

    const handleSelectTopics = () => {
        navigate(`/${user.id}/topics`);
    };

    const handleGoFeatured = () => {
        console.log(user.lastRead);
        navigate(`/${user.id}/featured`);
    };

    const handleGoPulseCheck = () => {
        navigate(`/${user.id}/pulsecheck`);
    }

    const handleLastRead = () => {
        console.log('going to last read article!');
    }

    const handleViewLiked = () => {
        setViewInteracted('liked');
        navigate(`/${user.id}/seeYourContent`)
    }

    const handleViewSaved = () => {
        setViewInteracted('saved');
        navigate(`/${user.id}/seeYourContent`)
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-black min-h-screen">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">PULSE</h1>
                <nav className="space-x-1">
                    <button className="btn text-primary" onClick={handleViewLiked}>♥</button>
                    <button className="btn text-secondary" onClick={handleViewSaved}>★</button>
                    <button className="btn text-white" onClick={handleGoFeatured}>Featured Stories</button>
                    <button className="btn text-white" onClick={handleGoPulseCheck}>PULSECHECK</button>
                    <button className="btn text-white">About Us</button>
                </nav>
            </header>
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
                    <p className="text-gray-400">{lastRead.description}</p>
                </div>
                <div className="bg-gradient-to-r from-[#2E008E] via-[#7042D2] to-[#FCC188] rounded-lg p-4 mb-8">
                    <h3 className="text-lg font-bold mb-4">YOUR PULSE POINTS</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {topics.map(topic => (
                            <button key={topic} className="bg-black text-white p-4 rounded-lg text-center ">{topic}</button>
                        ))}
                    </div>
                </div>
                <div className="flex space-x-4">
                    <button className="btn btn-primary bg-[#EB73CB] rounded-lg px-4 py-2" onClick={handleSelectTopics}>Edit your interests</button>
                    <button className="btn btn-primary bg-[#EB73CB] rounded-lg px-4 py-2">See updates on your most recently asked question</button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;


