import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleShowSignIn = () => {
        navigate(`/login`);
    };

    return (
        <div className="flex justify-center items-center h-screen" style={{
            background: 'linear-gradient(135deg, #FCC188, #AE7AB2, #7042D2, #2E008E)',
            color: 'white',
            textAlign: 'center',
            padding: '0 20px',
        }}>
            <div className="container mx-auto">
                <h1 className="text-5xl font-bold mb-4">PULSE</h1>
                <p className="text-xl mb-4">Navigate the Now.</p>
                <button
                    className="btn btn-custom"
                    style={{
                    }}
                    onClick={handleShowSignIn}
                >
                    Sign In/Log In
                </button>
            </div>
        </div>
    );
};

export default LandingPage;

