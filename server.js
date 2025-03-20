import express from 'express';
import path from 'path';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

// Serve static files (index.html, tree.html, chat.html, assets, etc.)
app.use(express.static(path.join(__dirname, 'out')));

// Debugging: Log the environment variable
console.log('VENICE_API_KEY:', process.env.VENICE_API_KEY);

// Venice API setup
const openai = new OpenAI({
  apiKey: process.env.VENICE_API_KEY?.trim(), // Trim to avoid trailing spaces
  baseURL: 'https://api.venice.ai/api/v1',
});

// Chat API endpoint using live API key
app.post('/api/chat', async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: 'You are Peanutoshi NUTkamoto, a nutty AI assistant.' },
        { role: 'user', content: req.body.message },
      ],
      venice_parameters: {
        enable_web_search: 'auto',
        include_venice_system_prompt: true,
      },
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process your request. Please try again.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
