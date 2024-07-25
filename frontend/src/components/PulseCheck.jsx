import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';

const PulseCheck = ({ user, setViewInteracted }) => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');
    const [questionKeywords, setQuestionKeywords] = useState([]);

    const handleInputChange = (event) => {
        setPrompt(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setQuestions([]);
        setError('');

        try {
            const result = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/llama3/generate-pulsecheck-response`, { prompt: prompt });
            const extractedData = result.data.extractedData;
            setQuestions(extractedData);
        } catch (err) {
            setError('Failed to generate text');
            console.error(err);
        }
    };

    return (
        <>
            <NavBar user={user} setViewInteracted={setViewInteracted}/>
            <h1>Welcome to PULSECHECK</h1>
            <div>
                <h1>PulseCheck Test</h1>
                <form onSubmit={handleSubmit}>
                    <label>
                        Prompt:
                        <input type="text" value={prompt} onChange={handleInputChange} />
                    </label>
                    <button type="submit">Generate</button>
                </form>
                {questions.length > 0 && (
                    <div>
                        <h2>Generated Questions:</h2>
                        {questions.map((q, index) => (
                            <div key={index} onClick={() => setQuestionKeywords(q.keywords)}>
                                <h3>{q.question}</h3>
                            </div>
                        ))}
                    </div>
                )}
                {error && (
                    <div>
                        <h2>Error:</h2>
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default PulseCheck;