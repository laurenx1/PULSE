import React, { useEffect, useState } from 'react'; 
import axios from 'axios'; 
import AIContentDetector from './AIContentDetector';


const ArticleScrape = ( { article }) => {
    const [content, setContent] = useState(''); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const url = article.url;

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                console.log(url); // undefined, so is article.link
                
                const response = await axios.get('http://127.0.0.1:5000/scrape', {params: { url }})
                setContent(response.data.content); 
            } catch (error) {
                console.error('Error fetching the article', error); 
                setError('Error fetching the article'); 
            } finally {
                setLoading(false);
            }
        };
        
        fetchArticle();
    }, [url]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>

    return (
        <>
        <h1>Scraped Article</h1>
        <div>{content}</div>
        <AIContentDetector content={content}/>
        </>
    );
};

export default ArticleScrape; 