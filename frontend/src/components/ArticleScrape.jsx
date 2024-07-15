import React, { useEffect, useState } from 'react'; 
import axios from 'axios'; 
import AIContentDetector from './AIContentDetector';
import { format } from 'date-fns';

const ArticleScrape = ({ article }) => {
    const [content, setContent] = useState(''); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [real, setReal] = useState(null);
    const [fake, setFake] = useState(null);

    const url = article.url || article.link;
    let realScore = 'N/A';
    let fakeScore = 'N/A';

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                console.log(url); // undefined, so is article.link
                
                const response = await axios.get('http://127.0.0.1:5000/scrape', {params: { url }});
                setContent(response.data.content); 
            } catch (error) {
                console.error('Error fetching the article', error); 
                setError('Error fetching the article'); 
            } finally {
                setLoading(false);
            }
        };
        
        fetchArticle();



        const fetchScores = async () => {
            if (real && fake) {
                realScore = real; 
                fakeScore = fake; 
            }
        }

        fetchScores();
    }, [url, real, fake]);

    if (loading) return <span className="loading loading-spinner text-primary"></span>;
    if (error) return <div>{error}</div>;



    return (
        <div className="p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center text-green-500">
                    <span className="text-lg">{real}% Real</span>
                </div>
                <div className="flex text-red-500">
                    <span className="text-lg">{fake}% Fake</span>
                </div>
            </div>
            <h1 className="text-4xl font-bold my-4">{article.title}</h1>
            <div className="text-sm text-gray-500 mb-2">
                <span className="mr-4">Author: {article.creator || article.author}</span>
                <span>Date: {format(new Date(article.pubDate || article.publishedAt), 'PP')}</span>
            </div>
            <div className="bg-info p-4 rounded-lg mb-4">
                <strong>Description:</strong> {article.description}
            </div>
            <div>{content}</div>
            {content && <AIContentDetector content={content} setReal={setReal} setFake={setFake} />}
        </div>
    );
};

export default ArticleScrape;
