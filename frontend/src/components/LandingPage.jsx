import React from 'react';
import { useNavigate } from "react-router-dom";



const LandingPage = () => {
    const navigate = useNavigate();

    const handleShowSignIn = () => {
        navigate(`/login`);
    };
    return (
        <div>
        <h1>PULSE</h1>
        <p>Welcome to PULSE!</p>
        <button onClick={handleShowSignIn}>Sign In/Log In</button>
        </div>
    );
};
export default LandingPage;