import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import newsCategories from '../data/topics';
import axios from 'axios';

const TopicSelector = ({user, setTopics}) => {
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState(user.preferredTopics);

  const handleSelect = topic => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else if (selectedTopics.length < 6) {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/update/users/${user.id}`,
        {
          preferredTopics: selectedTopics,
        },
      );
      setTopics(selectedTopics);
      navigate(`/profile/${user.id}`);
    } catch (error) {
      console.error('Error updating preferred topics:', error);
      alert('Failed to update preferred topics.');
    }
  };

  return (
    <div className="topic-selector-container bg-gradient-to-b from-[#FCC188] via-[#AE7AB2] to-[#2E008E] text-white min-h-screen flex flex-col items-center justify-center w-full">
      <h1 className="text-4xl font-bold mb-4">PULSE POINTS</h1>
      <p className="text-lg mb-6">Choose up to 6 topics that interest you.</p>
      <div className="grid grid-cols-4 gap-12">
        {newsCategories.map(category => (
          <div
            key={category.id}
            className={`topic-item cursor-pointer p-4 rounded-lg flex items-center justify-center text-center h-30 w-30 ${selectedTopics.includes(category.name) ? 'bg-black text-white' : 'bg-black/60 text-gray-200'}`}
            onClick={() => handleSelect(category.name)}>
            {category.name}
          </div>
        ))}
      </div>
      <button
        className="done-button btn btn-primary mt-6"
        onClick={handleSubmit}
        disabled={selectedTopics.length === 0}>
        Done
      </button>
    </div>
  );
};

export default TopicSelector;
