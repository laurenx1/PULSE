import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleScrape from './ArticleScrape';

const Story = ( { user, clickedArticle}) => {
    const navigate = useNavigate();

    

    return (
        <>
        <h1>WELCOME TO THE STORY</h1>
        <h3>hello {user.username}</h3>
        <p>you want to see {clickedArticle.title}</p>
        <div>
            <iframe src={clickedArticle.link} title='embedded article' allowFullScreen></iframe>
        </div>

        <ArticleScrape article={clickedArticle}/>
        </>
    );
};

export default Story;