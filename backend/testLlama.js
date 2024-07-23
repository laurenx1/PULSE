const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


const content = 'hiiii';

const testLlamaRes = async (content) => {
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user', 
                    content: content
                }
            ],
            model: 'llama3-8b-8192',
        }); 

        const llamaRes = response.choices[0].message?.content || "I didn't understand.";
        
        res.json({
            response: llamaRes, 
        });
    } catch (error) {
        console.error("Error getting LLaMA-3:", error);
        res.status(500).json({error: 'error'})
    }
}