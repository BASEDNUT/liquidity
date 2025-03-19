export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { message } = req.body;

        // Process the message and generate a reply
        const reply = `You said: ${message}`;

        res.status(200).json({ reply });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
