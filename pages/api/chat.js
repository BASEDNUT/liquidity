import { validateEnv } from '../../utils/validateEnv';

export default async function handler(req, res) {
    try {
        // Validate environment variables
        validateEnv();

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const apiKey = process.env.VENICE_API_KEY;
        if (!apiKey || apiKey === 'undefined' || (process.env.NODE_ENV !== 'production' && apiKey.startsWith('@'))) {
            console.error('Invalid VENICE_API_KEY configuration');
            return res.status(500).json({ 
                error: 'Server configuration error',
                message: 'API key not properly configured'
            });
        }

        const {
            model,
            messages,
            venice_parameters,
            frequency_penalty,
            presence_penalty,
            repetition_penalty,
            temperature,
            max_tokens,
            max_temp,
            min_temp,
            max_completion_tokens,
            top_k,
            top_p,
            min_p,
            stop,
            stop_token_ids,
            stream,
        } = req.body;

        // Validate required fields
        if (!model || !messages) {
            console.error('Missing required fields: model or messages');
            return res.status(400).json({ error: 'Missing required fields: model or messages' });
        }

        const payload = {
            model,
            messages,
            venice_parameters,
            frequency_penalty,
            presence_penalty,
            repetition_penalty,
            n: 1,
            max_tokens,
            max_temp,
            min_temp,
            max_completion_tokens,
            temperature,
            top_k,
            top_p,
            min_p,
            stop,
            stop_token_ids,
            stream,
            // Uncomment and adjust the following line if stream options are desired:
            // stream_options: { include_usage: true }
        };

        const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error('Error from Venice API:', errData);
            return res.status(response.status).json({ error: 'Error from Venice API', details: errData });
        }

        const data = await response.json();
        // Adjust according to the actual response structure:
        const reply = data.reply || (data.choices && data.choices[0]?.message?.content) || 'No reply available';

        console.log('Generated reply:', reply);
        res.status(200).json({ reply });
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
