const express = require('express');
const router = express.Router();
const Groq = require("groq-sdk"); // Import groq if it's a separate module or use your actual import method

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Define the /generate-pulsecheck-response route
router.post('/generate-pulsecheck-response', async (req, res) => {
    const userInput = req.body.prompt;
    const prompt = "Four questions one could ask Google about (and an array of 5 single-word keywords for each question) relating to the following topic and current events: ";
  
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "do not provide any text but the questions and the array (no preceding response). Please provide them in the format Question 1: Question Keywords: []",
                  },
                {
                    role: 'user', 
                    content: prompt + userInput
                }, 
                
            ],
            model: 'llama3-8b-8192',
             // Controls randomness: lowering results in less random completions.
            // As the temperature approaches zero, the model will become deterministic
            // and repetitive.
            // good to have low temperature here to make more predicatable for parsing.
            temperature: 0.2,

            // The maximum number of tokens to generate. Requests can use up to
            // 2048 tokens shared between prompt and completion.

            // low tokens here to create more predictable response fo parsing (less words, forced to condense to questions and keywords)
            max_tokens: 200,
        }); 
  
        const llamaRes = response.choices[0].message?.content || "I didn't understand.";
        console.log(llamaRes);

        // Define a regular expression to match questions and keywords
        const questionRegex = /Question \d+: (.+?) Keywords: \[(.+?)\]/g;
        let match;
        const results = [];

        // Extract the relevant part of the response
        const relevantText = llamaRes.trim();

        // Iterate over matches and extract questions and keywords
        while ((match = questionRegex.exec(relevantText)) !== null) {
            const question = match[1].trim();
            const keywords = match[2].split(',').map(keyword => keyword.trim().replace(/"/g, ''));
            results.push({
                question: question,
                keywords: keywords
            });
        }
  
        res.json({
            extractedData: results
        });
      
    } catch (error) {
        console.error("Error getting LLaMA-3:", error);
        res.status(500).json({ error: 'error' });
    }
});

module.exports = router;

