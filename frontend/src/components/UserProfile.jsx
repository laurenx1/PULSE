import React from 'react';
import './UserProfile.css';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ user }) => {
    const { username, preferredTopics, liked, saved } = user;

    const navigate = useNavigate();

    const handleSelectTopics = () => {
        navigate(`/${user.id}/topics`)
    };


    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1 className="pulse-logo">PULSE</h1>
                <nav className="profile-nav">
                    <button>Featured Stories</button>
                    <button>PULSE CHECK</button>
                    <button>About Us</button>
                </nav>
            </header>
            <div className="profile-content">
                <h2 className="username">{username}'s Profile</h2>
                <div className="last-read">
                    <h3>LAST READ</h3>
                    <h4>ARTICLE HEADLINE</h4>
                    <p className="no-ai">• No AI generated content</p>
                    <p>blah blah blah brief article description blah lorem ipsum or whatever they usually say</p>
                </div>
                <div className="profile-interactions">
                    <div className="saved-content">
                        <span className="star">★</span>
                        <p>See your saved content here</p>
                    </div>
                    <div className="liked-content">
                        <span className="heart">♥</span>
                        <p>See your liked content here</p>
                    </div>
                </div>
                <div className="pulse-points">
                    <h3>YOUR PULSE POINTS</h3>
                    {preferredTopics.map(topic => (
                        <div key={topic} className="pulse-point">
                            {topic}
                        </div>
                    ))}
                    <button className="edit-interests-button" onClick={handleSelectTopics}>Edit your interests</button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
