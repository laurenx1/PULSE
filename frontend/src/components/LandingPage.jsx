import React from 'react';
import { useNavigate } from "react-router-dom";



const LandingPage = () => {
    const navigate = useNavigate();

    const handleShowSignIn = () => {
        navigate(`/login`);
    };
    return (
        <div className="container mx-auto px-4 flex justify-center items-center h-screen">
            <article className="prose text-center">
                <h1>PULSE</h1>
                <p>Welcome to PULSE!</p>
                <button className="btn btn-primary" onClick={handleShowSignIn}>Sign In/Log In</button>
            </article>
        </div>
    );
};
export default LandingPage;
