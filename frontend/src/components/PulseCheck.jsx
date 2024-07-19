import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PulseCheck = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (event) => {
        setPrompt(event.target.value);
      };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setResponse('');
        setError('');

        try {
            const result = await axios.post(import.meta.env.VITE_BACKEND_URL + '/generate-pulsecheck-response', { prompt: prompt });
            setResponse(result.data.generatedText);
        } catch (err) {
            setError('Failed to generate text');
            console.error(err);
        }
    };

    return (
       <>
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
        {response && (
            <div>
            <h2>Generated Response:</h2>
            <p>{response}</p>
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