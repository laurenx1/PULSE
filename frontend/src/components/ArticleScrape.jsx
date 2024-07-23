import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AIContentDetector from './AIContentDetector';
import { format } from 'date-fns';
import { fetchArticleContent, handleDetection } from '../utils/utils';

const ArticleScrape = ({ article }) => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [real, setReal] = useState(null);
    const [fake, setFake] = useState(null);

    const url = article.url || article.link;
    let realScore = 'N/A';
    let fakeScore = 'N/A';

    useEffect(() => {
        fetchArticleContent(setContent, article, setError, setLoading);

        content && handleDetection(article.content.join(' '), setReal, setFake, article.id);


    }, [url, real, fake, content, article.id]);


    if (loading) return <span className="loading loading-spinner text-primary"></span>;
    if (error) return <div>{error}</div>;

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-green-500">
                    <span className="text-lg">{real}% Real</span>
                </div>
                <div className="flex text-red-500">
                    <span className="text-lg">{fake}% Fake</span>
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






