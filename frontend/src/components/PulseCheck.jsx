import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';

const PulseCheck = ({user, setViewInteracted, setQuestion, setQuestionKeywords}) => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');

  const handleInputChange = event => {
    setPrompt(event.target.value);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setQuestions([]);
    setError('');

    try {
      const result = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/llama3/generate-pulsecheck-response`,
        {prompt: prompt},
      );
      const extractedData = result.data.extractedData;
      setQuestions(extractedData);
    } catch (err) {
      setError('Failed to generate text');
      console.error(err);
    }
  };

  return (
    <>
      <NavBar user={user} setViewInteracted={setViewInteracted} />
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold">Hello, {user.username}.</h1>
        <h2 className="font-bold">Welcome to PULSECHECK,</h2>
        <h3>
          {' '}
          a place that prompts you to think critically and specifically about the news you read.
        </h3>
        <form onSubmit={handleSubmit} className="flex mt-8">
          <input
            type="text"
            value={prompt}
            onChange={handleInputChange}
            placeholder="AI"
            className="input input-bordered w-80 mr-2"
          />
          <button type="submit" className="btn btn-circle btn-outline">
            GO
          </button>
        </form>
        {questions.length > 0 && (
          <div className="mt-8 w-full max-w-md space-y-4">
            {questions.map((q, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 cursor-pointer text-lg ${index % 2 === 0 ? 'bg-gradient-to-r from-[#1E90FF] to-[#00FA9A]' : index % 3 === 0 ? 'bg-gradient-to-r from-purple-500 to-purple-900' : 'bg-gradient-to-r from-pink-500 to-purple-500'}`}
                onClick={() => {
                  setQuestionKeywords(q.keywords);
                  setQuestion(q.question);
                  navigate(`/${user.id}/pulsecheck-articles`);
                }}>
                {q.question}
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="mt-8 text-red-500">
            <h2>Error:</h2>
            <p>{error}</p>
          </div>
        )}
        <button className="btn btn-secondary mt-8">AI &gt;</button>
      </div>
    </>
  );
};

export default PulseCheck;
