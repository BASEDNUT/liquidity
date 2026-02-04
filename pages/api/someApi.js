import { validateEnv } from '../../utils/validateEnv';

export default function handler(req, res) {
  validateEnv();

  // ...existing code...
  res.status(200).json({ message: 'API is working' });
}
