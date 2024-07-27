# Backend README

## articleEndpointRoutes.js
handles all endpoints related to feeding articles to frontend based on specific need, which includes
- getting breaking articles
- getting related articles (found with collaborative filtering recommendation algorithms)
- getting articles for PULSECHECK
- viewing liked / saved articles
- viewing articles related to a specific topic

## authRoutes.js
Handles all endpoints related to user authentication: signing in, logging in, using Google account to do either. 

## debugExport.js
debug file to test export bug with fetchAndCacheArticlesByTopics function in index.js

## index.js
Handles all related to caching articles in database by fetching from [the Newsdata API](newsdata.io). Includes AI-generated content scoring using openAI's RoBERTa model for detecting GPT-2 outputs via **HuggingFace**. 

## keywordExtract.js
Functions to ensure that all articles cached have a non-empty keywords field so that they can be searched for. 
Uses NLP libraries ```natural``` and ```stopword``` for this task.

## manualScraping.js
Optional script to sweep through database and content scrape. 
Includes retry mechanism of 3x to get article content. 

## pulsecheckRoutes.js
Handles API call to LLaMA-3 model (version: llama3-8b-8192) via ```groq``` to generate questions for PULSECHECK
in order to prompt the user to think more critically and specifically about their initial search. 

## pulsecheckUtils.js
Functions to search database for articles related to selected PULSECHECK questions. 

## recommendUtils.js
Functions to build recommendation algorithm: 
How the collaborative filtering algorithm works: calculates similarity between users by taking a weighted sum of shared liked / saved articles, as well as shared interests (preferred topics). If User A and B are similar, then recommends articles to User A that User B has liked / saved, but User A has likely not seen before (hasn't already liked, saved, have in lastRead). 

In order to ensure that there are enough articles that meet the interests of all users, a frequency dictionary of preferred topics across all users is made, and on API calls to newsdata, finds articles related to the most popular topics (highest frequency) and caches them. 

## scraper.js
Script to scrape article content from the provided URL. Parses p tags from the HTML content with ```parseHTML```. Cleans article text (removes non-ASCII characters, extra whitespaces), and stores in database as an array of paragraphs (strings) for formatting in frontend.  

## userActionRoutes.js
Handles all endpoints for changes a user makes to their profile: 
- liking / saving an article
- changing their interests (```preferredTopics```)
- updating their lastRead article (this is not done by user, but tracked in frontend)

## tests
### suite 1: extractKeywords.test.js
tests that ```keywordExtract``` works properly

### suite 2: index.test.js
tests that ```fetchAndCacheArticlesByTopics``` in index.js works properly

