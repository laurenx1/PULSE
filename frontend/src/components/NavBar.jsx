import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavBar = ({ user, setViewInteracted }) => {
    const navigate = useNavigate();

    const handleGoFeatured = () => {
        navigate(`/${user.id}/featured`);
    };

    const handleGoPulseCheck = () => {
        navigate(`/${user.id}/pulsecheck`);
    };

    const handleViewLiked = () => {
        setViewInteracted('liked');
        navigate(`/${user.id}/seeYourContent`);
    };

    const handleViewSaved = () => {
        setViewInteracted('saved');
        navigate(`/${user.id}/seeYourContent`);
    };

    const handleGoUserProfile = () => {
        navigate(`/profile/${user.id}`);
    };

    return (
        <header className="flex items-center justify-between mb-8 ">
            <h1 className="text-3xl font-bold text-white">PULSE</h1>
            <nav className="space-x-1 bg-transparent">
                <button 
                    className="btn text-pink-500 text-2xl hover:text-pink-700 bg-transparent"
                    onClick={handleViewLiked}
                >
                    ♥
                </button>
                <button 
                    className="btn text-purple-500 text-2xl hover:text-purple-700 bg-transparent hover:bg-transparent"
                    onClick={handleViewSaved}
                >
                    ★
                </button>
                <button 
                    className="btn text-white text-xl hover:text-gray-300 bg-transparent hover:bg-transparent"
                    onClick={handleGoFeatured}
                >
                    Featured Stories
                </button>
                <button 
                    className="btn text-white text-xl hover:text-gray-300 bg-transparent hover:bg-transparent"
                    onClick={handleGoPulseCheck}
                >
                    PULSECHECK
                </button>
                <button 
                    className='btn text-[#00FA9A] text-xl hover:text-[#32CD32] bg-transparent hover:bg-transparent'
                    onClick={handleGoUserProfile}
                >
                    {user.username}
                </button>
                <button 
                    className="btn text-white text-xl hover:text-gray-300 bg-transparent hover:bg-transparent"
                >
                    About Us
                </button>
            </nav>
        </header>
    );
};

export default NavBar;
