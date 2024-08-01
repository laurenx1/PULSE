import {useNavigate} from 'react-router-dom';
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import NavBar from './NavBar';
import {handleArticleClick} from '../utils/utils';
import ArticleBoard from './ArticleBoard';


const TopicStories = ({user, setClickedArticle, viewTopic, }) => {
  const navigate = useNavigate();

  return (
    <>
    <p>here are your {viewTopic} articles!</p>
    </>
  );
};

export default TopicStories;