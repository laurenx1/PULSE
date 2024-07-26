import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { fetchArticleContent } from '../utils/utils';

const ArticleScrape = ({ article }) => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const url = article.url || article.link;

    useEffect(() => {
        fetchArticleContent(setContent, article, setError, setLoading);
    }, [url, content, article.id]);


    if (loading) return <span className="loading loading-spinner text-primary"></span>;
    if (error) return <div>{error}</div>;

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-green-500">
                    <span className="text-lg">{article.realScore === 0 ? "NO SCORE CALCULATED" : (article.realScore * 100).toFixed(4) + "% Real"}</span>
                </div>
                <div className="flex text-red-500">
                    <span className="text-lg">{article.fakeScore === 0 ? "NO SCORE CALCULATED" : (article.fakeScore * 100).toFixed(4) + "% Fake"}</span>
                </div>
            </div>
            <h1 className="text-4xl font-bold my-4">{article.title}</h1>
            <div className="text-sm text-gray-500 mb-4">
                <span className="mr-4">Author: {article.creator || article.author}</span>
                <span className="text-[#AE7AB2]">Date: {format(new Date(article.pubDate || article.publishedAt), 'PP')}</span>
            </div>
            <div className="bg-info p-6 rounded-lg mb-6">
                <strong>Description:</strong> {article.description}
            </div>
            <div className="space-y-4">
                {content
                    .filter(paragraph => 
                        paragraph.split(' ').length >= 5 && 
                        !paragraph.includes('Your browser is')
                    )
                    .map((paragraph, index) => (
                        <p key={index} className="mb-4">{paragraph}</p>
                ))}
            </div>

        </div>
    );
};

export default ArticleScrape;






