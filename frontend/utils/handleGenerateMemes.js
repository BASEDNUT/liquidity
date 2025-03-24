export async function handleGenerateMemes(input, style = 'kawaii') {
  if (!input.trim()) {
    console.error("Input is empty or invalid."); // Log invalid input
    return;
  }

  try {
    const response = await fetch('/api/nutinoMemes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, style }), // Include style in the request
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Generated memes:', data);
    return data;
  } catch (error) {
    console.error('Error generating memes:', error);
  }
}
