import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AIContentDetector = ({ content, setReal, setFake }) => {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);

    const truncateText = (text, wordLimit) => {
        const words = text.split(' ');
        return words.slice(0, wordLimit).join(' ');
    };

    const handleDetection = async () => {
        if (!content) {
            console.warn('No content provided for detection.');
            return;
        }

        console.log(content); // line that prints out with newline
        try {
            const cleanedContent = content.replace(/\n/g, ' ');
            const truncatedContent = truncateText(cleanedContent, 310);
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/detect-ai-content-hf`, { text: truncatedContent });
            setResult(response.data);
            console.log('content detected!');

            const REAL = JSON.parse(JSON.stringify(result[0][0]))["score"];
            const FAKE = JSON.parse(JSON.stringify(result[0][1]))["score"];
            console.log(REAL * 100);
            // console.log(FAKE * 100);
         
            setReal((REAL * 100).toFixed(4));
            
            setFake((FAKE * 100).toFixed(4));


        } catch (error) {
            console.error('Error detecting AI content:', error);
        }
    }

    useEffect(() => {
        handleDetection();
    }, [content]);  // Only re-run the effect if content changes

    return (
        <>
            {/* {result && (
                <div>
                    <h3>Detection Result:</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )} */}
        </>
    );
};

export default AIContentDetector;
