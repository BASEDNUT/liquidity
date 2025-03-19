export default async function handler(req, res) {
    if (req.method === 'POST') {
        const payload = req.body;

        if (!payload.messages || !Array.isArray(payload.messages) || payload.messages.length === 0) {
            return res.status(400).json({ error: 'Invalid messages' });
        }

        try {
            const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
                },
                body: JSON.stringify({
                    ...payload,
                    temperature: payload.temperature || 0.7,
                    top_p: payload.top_p || 0.9,
                    frequency_penalty: payload.frequency_penalty || 0,
                    presence_penalty: payload.presence_penalty || 0,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Venice API Error:', errorText);
                return res.status(response.status).json({ error: errorText || 'API error' });
            }

            const result = await response.json();
            const reply = result.choices?.[0]?.message?.content || 'No reply from Venice API.';
            res.status(200).json({ reply });
        } catch (error) {
            console.error('Error calling Venice API:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
