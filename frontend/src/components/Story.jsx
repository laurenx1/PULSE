import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import ArticleScrape from './ArticleScrape';
import NavBar from './NavBar';
import {set} from 'date-fns';

const Story = ({user, clickedArticle, setViewInteracted}) => {
  const [liked, setLiked] = useState(user.liked.includes(clickedArticle.id));
  const [saved, setSaved] = useState(user.saved.includes(clickedArticle.id));

  useEffect(() => {
    // Check if the article has been liked or saved already
    setLiked(user.liked.includes(clickedArticle.id));
    setSaved(user.saved.includes(clickedArticle.id));
  }, [clickedArticle.id, user.liked, user.saved]);

  const handleLike = async () => {
    if (liked) return; // Prevent multiple likes
    try {
      await axios.post(
        import.meta.env.VITE_BACKEND_URL +
          `/update/articles/${clickedArticle.id}/like`,
        {userId: user.id},
      );
      setLiked(true);
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleSave = async () => {
    if (saved) return; // Prevent multiple saves
    try {
      await axios.post(
        import.meta.env.VITE_BACKEND_URL +
          `/update/articles/${clickedArticle.id}/save`,
        {userId: user.id},
      );
      setSaved(true);
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  return (
    <>
      <div className="relative mb-20">
        <NavBar user={user} setViewInteracted={setViewInteracted} />
        <div className="absolute top-16 right-0 flex items-center space-x-2 mr-4 mb-4">
          <button
            className={`btn text-2xl ${liked ? 'text-pink-500' : 'text-white'}`}
            onClick={handleLike}>
            {liked ? '♥' : '♡'}
          </button>
          <button
            className={`btn text-2xl ${saved ? 'text-purple-500' : 'text-white'}`}
            onClick={handleSave}>
            {saved ? '★' : '☆'}
          </button>
        </div>
      </div>

      <ArticleScrape article={clickedArticle} />
    </>
  );
};

export default Story;
