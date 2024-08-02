import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { fetchArticleContent } from '../utils/utils';
import './predictModal.css'; // Custom CSS if needed
import { renderPrediction } from '../utils/textUtils';

const ArticleScrape = ({ article }) => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highlightedText, setHighlightedText] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const modalRef = useRef(null);

  const url = article.url || article.link;

  useEffect(() => {
    fetchArticleContent(setContent, article, setError, setLoading);
  }, [url, article.id]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) {
        setHighlightedText(selectedText);
        sendHighlightedText(selectedText);
      } else {
        setIsModalVisible(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const sendHighlightedText = async (text) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/bert/predict`, { text });
      setModalContent(response.data.prediction);
      console.log(modalContent);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error sending highlighted text:', error);
    }
  };

  const handleCloseModal = (event) => {
    event.stopPropagation(); // Prevent click event from bubbling up to the document
    setIsModalVisible(false);
    window.getSelection().removeAllRanges();
    setHighlightedText('');
  };

  if (loading) return <span className="loading loading-spinner text-primary"></span>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-success">
          <span className="text-lg">
            {article.realScore === 0
              ? 'NO SCORE CALCULATED'
              : `${(article.realScore * 100).toFixed(4)}% Real`}
          </span>
        </div>
        <div className="flex text-red-500">
          <span className="text-lg">
            {article.fakeScore === 0
              ? 'NO SCORE CALCULATED'
              : `${(article.fakeScore * 100).toFixed(4)}% Fake`}
          </span>
        </div>
      </div>
      <h1 className="text-4xl font-bold my-4">{article.title}</h1>
      <div className="text-sm text-pink-500 mb-4">
        <span className="mr-4">
          Author: {article.creator || article.author}
        </span>
        <span className="text-purple-500">
          Date: {format(new Date(article.pubDate || article.publishedAt), 'PP')}
        </span>
      </div>
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 rounded-lg mb-6">
        <strong>Description:</strong> {article.description}
      </div>
      <div className="space-y-4">
        {content
          .filter(
            (paragraph) =>
              paragraph.split(' ').length >= 5 &&
              !paragraph.includes('Your browser is')
          )
          .map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}

        {/* Modal */}
        {isModalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" ref={modalRef}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-9/12 md:w-1/3 relative">
              <h2 className="text-lg font-bold mb-4">Prediction</h2>
              <p>{renderPrediction(modalContent)}</p>
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 btn btn-sm btn-circle"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleScrape;



