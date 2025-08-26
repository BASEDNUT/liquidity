import { validateEnv } from '../../utils/validateEnv';

export default function handler(req, res) {
  validateEnv();

  // Avoid logging secrets
  console.log('Venice key configured:', Boolean(process.env.VENICE_API_KEY));

  // ...existing code...
  res.status(200).json({ message: 'API is working' });
}
