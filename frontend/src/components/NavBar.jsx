import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavBar = ({user, setViewInteracted }) => {
    console.log(user);
    const navigate = useNavigate();

    const handleGoFeatured = () => {
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

    const handleGoUserProfile = () => {
        navigate(`/profile/${user.id}`)
    }


    return (
        <>
        <header className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">PULSE</h1>
            <nav className="space-x-1">
                <button className="btn text-primary" onClick={handleViewLiked}>♥</button>
                <button className="btn text-secondary" onClick={handleViewSaved}>★</button>
                <button className="btn text-white" onClick={handleGoFeatured}>Featured Stories</button>
                <button className="btn text-white" onClick={handleGoPulseCheck}>PULSECHECK</button>
                <button className='btn text-primary' onClick={handleGoUserProfile}>{user.username}</button>
                <button className="btn text-white">About Us</button>
            </nav>
        </header>
        </>
    );
};

export default NavBar;