import React from 'react';
import { useNavigate } from "react-router-dom";


// https://newsdata.io/api/1/news?apikey=[APIKey]&q=[QUERY]&country=us&language=en&category=politics 
// spaces / words in query separated by %20


const FeaturedStories = ( {user} ) => {
    const apiKey = import.meta.env.NEWSDATA_API_KEY; 
    let topics = user.preferredTopics

    return (
        <div>
        <h1>Welcome to your daily Featured Stories page!</h1>
        </div>
    );
};
export default FeaturedStories;