import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import newsCategories from "../data/topics";
import '../style/TopicSelector.css'
import axios from 'axios';

const TopicSelector = ({ user }) => {
    const navigate = useNavigate(); 



    const [selectedTopics, setSelectedTopics] = useState([]); 

    const handleSelect = (topic) => {
        if (selectedTopics.includes(topic)) {
            setSelectedTopics(selectedTopics.filter(t => t !== topic));
          } else if (selectedTopics.length < 6) {
            setSelectedTopics([...selectedTopics, topic]);
          }
    };

    const handleSubmit = async () => {
        try {
          await axios.patch( import.meta.env.VITE_BACKEND_URL + `/api/users/${user.id}`, { preferredTopics: selectedTopics });
          alert('Preferred topics updated successfully!');
        } catch (error) {
          console.error('Error updating preferred topics:', error);
          alert('Failed to update preferred topics.');
        }

        // go back to profile once done button clicked
        navigate(`/profile/${user.id}`);
      };

      return (
        <div className="topic-selector-container">
          <h1>PULSE POINTS</h1>
          <p>Choose up to 6 topics that interest you.</p>
          <div className="topic-grid">
            {newsCategories.map(category => (
              <div
                key={category.id}
                className={`topic-item ${selectedTopics.includes(category.name) ? 'selected' : ''}`}
                onClick={() => handleSelect(category.name)}
              >
                {category.name}
              </div>
            ))}
          </div>
          <button className="done-button" onClick={handleSubmit} disabled={selectedTopics.length === 0}>
            Done
          </button>
        </div>
      );
};
      
    

export default TopicSelector; 