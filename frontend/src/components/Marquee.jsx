import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {removeStopwordsFromArray} from '../utils/textUtils';
import './Marquee.css';

const Marquee = ({user}) => {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true); // State to track loading status
  const marqueeTopics = user.preferredTopics;

  const fetchHeadlinesForMarquee = async () => {
    const topicsForHeadlines = removeStopwordsFromArray(marqueeTopics);
    try {
      const response = await axios.get(import.meta.env.VITE_BACKEND_URL + `/relevant-articles`, {
        params: {
          topics: topicsForHeadlines,
        },
      });
      setHeadlines(Object.values(response.data) || []);
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error('Error fetching headlines for marquee.');
      setLoading(false); // Set loading to false in case of an error
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchHeadlinesForMarquee();

    // Set interval to fetch headlines every 100 seconds
    const intervalId = setInterval(fetchHeadlinesForMarquee, 100000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [marqueeTopics]);

  if (loading) {
    return (
      <div className="marquee">
        <div className="marquee-content">Loading headlines...</div>
      </div>
    ); // Display a loading message or spinner
  }

  return (
    <div className="marquee">
      <div className="marquee-content">
        {headlines.length > 0 ? headlines.join('. ') : 'No headlines available'}
      </div>
    </div>
  );
};

export default Marquee;
