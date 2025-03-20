const VENICE_API_KEY = process.env.VENICE_API_KEY;

if (!VENICE_API_KEY || VENICE_API_KEY.startsWith('<')) {
  throw new Error('VENICE_API_KEY is missing or contains a placeholder value.');
}
