import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';


const UserProfile = ({ user }) => {
    const { username, preferredTopics, liked, saved } = user;

    const navigate = useNavigate();

    const handleSelectTopics = () => {
        navigate(`/${user.id}/topics`);
    };

    const handleGoFeatured = () => {
        navigate(`/${user.id}/featured`);
    }


    return (
        <div className="container mx-auto px-4 py-8 bg-base-100">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">PULSE</h1>
                <nav className="space-x-4">
                    <button className="btn btn-nav" onClick={handleGoFeatured}>Featured Stories </button>
                    <button className="btn btn-nav">PULSE CHECK</button>
                    <button className="btn btn-nav">About Us</button>
                </nav>
            </header>
            <div className="bg-base-200 rounded-lg shadow-md p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">{username}'s Profile</h2>
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-2">LAST READ</h3>
                    <h4 className="text-lg font-bold mb-2">ARTICLE HEADLINE</h4>
                    <p className="text-gray-400 mb-4">• No AI generated content</p>
                    <p className="text-gray-300">blah blah blah brief article description blah lorem ipsum or whatever they usually say</p>
                </div>
                <div className="flex mb-8">
                    <div className="flex items-center mr-4">
                        <span className="text-yellow-500 text-2xl">★</span>
                        <p className="ml-2">See your saved content here</p>
                    </div>
                    <div className="flex items-center">
                        <span className="text-primary text-2xl">♥</span>
                        <p className="ml-2">See your liked content here</p>
                    </div>
                </div>
                <div className='rounded-box max-w-md bg-black border'>
                    <h3 className="text-xl font-bold mb-4">YOUR PULSE POINTS</h3>
                    <div className="carousel carousel-center w-full flex space-x-4 p-4">
                        {preferredTopics.map(topic => (
                            <div key={topic} className="carousel-item card-normal rounded-box p-4 text-center bg-info">
                            {topic}
                </div>
        ))}
    </div>
    <button className="btn btn-primary rounded-box text-white mt-4" onClick={handleSelectTopics}>
        Edit your interests
    </button>
</div>
            </div>
        </div>
    );
};

export default UserProfile;
