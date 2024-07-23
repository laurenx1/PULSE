import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { truncateText, handleDetection } from '../utils/utils';

const AIContentDetector = ({ articleId, content, setReal, setFake }) => {

    useEffect(() => {
        handleDetection(content, setReal, setFake, articleId);
    }, [content, articleId]);  // Only re-run the effect if content or articleId changes

    return (
        <>
        </>
    );
};

export default AIContentDetector;

