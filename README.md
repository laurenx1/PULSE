# PULSE
[Project Plan](https://docs.google.com/document/d/1U9uEtUsyl6Beo5HP-gf2QxNXOfDI54W2FzqRf2XchrI/edit#heading=h.hzjrfh6fsp6b)

## How to Use
### Frontend
## Navigate the Now: Contextual, Personalized, Relevant News and Indie Features for College Students.
The aim of PULSE is to deliver personalized, contextualized news to a younger audience. Key features include: 

### Webscraped Articles (TC #1)
This efficiently handles web scraping and text processing by manually parsing HTML to extract text from <p> tags, using lightweight character iteration instead of external libraries. It includes custom functions for cleaning and formatting text, such as normalizing whitespace, replacing special characters, and removing non-ASCII characters, ensuring the content is clean and readable. The scrapeArticle function leverages Axios for network requests, includes error handling for robust scraping, and applies the cleaning functions to the fetched content. This approach balances simplicity, performance, and maintainability, making it well-suited for extracting and processing web content effectively. 

This streamlined approach ensures that users receive clean, readable text without the distraction and clutter like popups commonly associated with online content. Overall, this method delivers a focused and distraction-free presentation of web content.



### Collaborative Filtering Recommendation Algorithm (TC #2)
This algorithm calculates similarity between users by analyzing shared liked or saved articles and preferred topics. When two users are found to be similar, the algorithm recommends articles that the similar user has liked or saved but that the target user hasn't yet seen or interacted with. To ensure relevance, the system maintains a frequency dictionary of preferred topics across all users and fetches articles related to these popular topics from the news API. Articles are cached every half-hour through a cron job, ensuring that users receive up-to-date, interest-aligned recommendations. This approach ensures that content remains relevant and tailored to each user’s preferences while also exposing them to a diverse array of perspectives. 

### Political Bias Sentiment Analysis
To enhance political bias recognition in text, I undertook a comprehensive fine-tuning process for the BERT model. Here’s a detailed breakdown of the steps involved and their significance:

- Dataset Construction: I compiled a diverse dataset by collecting articles from various sources. This dataset was crucial for training the model to recognize different political biases.
- Labeling: Articles were annotated with labels (right-leaning, left-leaning, and neutral) based on their political orientation, determined using the Ad Fontes media bias chart. Accurate labeling is essential for teaching the model to distinguish between different biases effectively.
- Data Preprocessing: One-Hot Encoding: Labels were transformed into binary vectors (0/1) for each category. This encoding format is necessary for the model to interpret categorical data correctly. Tokenization: Texts were tokenized into single sentences, enabling the model to process and analyze individual sentences independently. 
- Randomization: The dataset was shuffled to ensure that the model trained on a well-mixed representation of the data, which helps in avoiding overfitting and improving generalization.
- Model Training: The BERT model was fine-tuned on the prepared dataset. Fine-tuning adjusts the model's weights based on specific task-related data, optimizing its performance for recognizing political bias in articles.
- Deployment: After training, the fine-tuned model and tokenizer were saved and integrated into the PULSE repository. This setup involved:
- Virtual Environment: A dedicated Python environment was created to manage dependencies and ensure compatibility.
- Server Setup: A Python server was configured to host the model, facilitating its use for inference.
- API Integration: I developed an API endpoint in JavaScript to interface with the model, allowing it to be incorporated into a web application. The model outputs a percentage score for each of the three bias classes, providing a nuanced assessment of political bias in texts.

**Why This Matters**: This fine-tuned BERT model enables precise detection of political bias, which is crucial for analyzing media content and understanding its potential influence on public perception. By integrating this model into a web app via an API, users can easily access and leverage this capability in real-time, enhancing the app's functionality and user experience.


### PULSECHECK
 PULSECHECK is a system that uses LLaMA-3 in order to prompt a user to think more critically about the questions they ask while searching for news articles. A user input's a query, and PULSECHECK prompts the user to specify their query further with auto-generated questions via LLaMA-3. A user can then select a question to further their query, and recieves a package of news articles related not just to their initial search, but tailored specifically to their question. For example, a user's initial search might be: *AI* and PULSECHECK might supplement them with questions like *"How is AI changing US Healthcare?"* or  *"How is AI used in modern finance and banking?"* and so on. 
 This is done by turning down the ```temperature``` and ```tokens``` of the model's response, so that the formatting is predictable enough to parse accurately every time.The model is prompted with a both a user and system prompt, which is the user's search and a prompt to dictate the formatting of the model's response - that it should be questions that focus on current events and the user's query in conjuncation, that for each question it should provide an array of keywords corresponding to this question. This array is then used to search through the article cache and find article that have the most matching keywords possible. 
