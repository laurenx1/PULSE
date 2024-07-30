import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import NavBar from './NavBar';
import Marquee from './Marquee';
import {handleArticleClick} from '../utils/utils';
import {truncateText} from '../utils/textUtils';

const UserProfile = ({
  user,
  setViewInteracted,
  clickedArticle,
  setClickedArticle,
  topics,
}) => {
  const navigate = useNavigate();

  const {username, preferredTopics} = user;
  const selectedTopics = topics.length !== 0 ? topics : user.preferredTopics;

  /**
   * @description: lastRead article will always be the lastClicked article
   * clickedArticle has useState of null, so gets lastRead from user data when this occurs
   * which is on first render after sign in
   */
  const lastRead = clickedArticle || user.lastRead;

  const handleSelectTopics = () => {
    navigate(`/${user.id}/topics`);
  };

  const handleLastRead = () => {
    handleArticleClick(user, lastRead, setClickedArticle, navigate);
  };

  const handleLastAsked = () => {
    console.log('going to your last asked question!');
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-black min-h-screen">
      <NavBar user={user} setViewInteracted={setViewInteracted} />
      <div className="bg-black text-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-4">
          <div className="rounded-full bg-gray-700 w-16 h-16"></div>
          <h2 className="text-4xl font-bold ml-4">{username}'s Profile</h2>
        </div>

        <div
          className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 rounded-lg cursor-pointer hover:opacity-60 mb-4"
          onClick={handleLastRead}>
          <div className="flex justify-between">
            <div>
              <p>LAST READ</p>
              <h2 className="text-3xl font-bold">{lastRead.title}</h2>
              <h3 className="text-3xl font-bold">{lastRead.author}</h3>
              <p>{truncateText(lastRead.description, 50)}</p>
            </div>
            <div className="text-right">
              <p className="text-success">
                {lastRead.realScore.toFixed(4) * 100}% Real Content Score
              </p>
            </div>
          </div>
        </div>

        <div className="bg-transparent rounded-lg p-4 mb-8">
          <h3 className="text-lg font-bold mb-4">YOUR PULSE POINTS</h3>
          <div className="grid grid-cols-6 gap-4">
            {selectedTopics.map(topic => (
              <button
                key={topic}
                className="bg-black outline outline-white text-white p-10 rounded-lg text-center hover:opacity-50">
                {topic}
              </button>
            ))}
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            className="btn btn-secondary rounded-lg px-4 py-2"
            onClick={handleSelectTopics}>
            Edit your interests
          </button>
          <button
            className="btn btn-secondary rounded-lg px-4 py-2"
            onClick={handleLastAsked}>
            See updates on your most recently asked question
          </button>
        </div>
      </div>
      <Marquee user={user} />
    </div>
  );
};

export default UserProfile;
