import validateEnv from '../../utils/validateEnv';

export default function handler(req, res) {
  validateEnv();

  console.log('VENICE_API_KEY:', process.env.VENICE_API_KEY); // Debug log

  // ...existing code...
  res.status(200).json({ message: 'API is working' });
}
