import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const SignIn = ( {setUser} ) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isSignUp, setIsSignUp] = useState(true); // Start with sign up mode

    const navigate = useNavigate(); 

    function handleVerifiedAccount (user) {
        navigate(`/profile/${user.id}`);
        setUser(user);

    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isSignUp) {
                // Handle sign up
                const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/register', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, username, password }),
                });
                const data = await response.json();
                console.log(data); // Handle response accordingly
                handleVerifiedAccount(); 
                } else {
                // Handle login
                const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/login', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                const data = await response.json();
                console.log(data); // Handle response accordingly
                handleVerifiedAccount(data.user); 
                }

            } catch (error) {
                console.error('Error logging in or signing up', error);
            }
        }
    

    return (
        <form onSubmit={handleSubmit}>
        <label>
            Email:
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
            Password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {isSignUp && (
            <label>
            Username:
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
        )}
        <button type="submit">{isSignUp ? 'Sign Up' : 'Log In'}</button>
        <p onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Already have an account? Log in' : 'Need an account? Sign up'}
        </p>
        </form>
    );
};

export default SignIn;
