import React, { useState } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";

const NutinoMemes = () => {
  const [input, setInput] = useState('');
  const [style, setStyle] = useState('kawaii'); // Default style
  const [model, setModel] = useState('flux-dev'); // Default model
  const [imageUrl, setImageUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [peanutoshiComment, setPeanutoshiComment] = useState(null);
  const [peanutoshiThinking, setPeanutoshiThinking] = useState('');

  function parseComment(comment) {
    const thinkRegex = /<think>([\s\S]*?)<\/think>/;
    const match = comment.match(thinkRegex);
    if (!match) return { normalComment: comment.trim(), thinking: null };
    const normalComment = comment.replace(thinkRegex, '').trim(); // Remove <think> content
    const thinking = match[1].trim(); // Extract <think> content
    return { normalComment, thinking };
  }

  const handleGenerateMemes = async () => {
    if (!input.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const response = await fetch('/api/nutinoMemes', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, style, model }), // Include model in the request
      });
      if (!response.ok) {
        throw new Error("Network error: " + response.status);
      }
      const data = await response.json();
      if (!data.comment) {
        throw new Error("Invalid response: comment is missing");
      }
      const { normalComment, thinking } = parseComment(data.comment);
      setPeanutoshiComment(normalComment); // Display normal comment
      setPeanutoshiThinking(thinking); // Display thinking content
      setImageUrl(data.imageUrl); // Use image URL
    } catch (error) {
      console.error('Error generating memes:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  function handleClear() {
    setInput('');
    setPeanutoshiComment(null);
    setPeanutoshiThinking('');
    setImageUrl(null);
  }

  return (
    <>
      <Header />
      <main style={{ padding: "20px", textAlign: "center", backgroundColor: "#F9F3E6", fontFamily: "Arial, sans-serif" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#5D4037", marginBottom: "1rem" }}>Nutty Images</h1>
        <p style={{ fontSize: "1rem", color: "#5D4037", marginBottom: "2rem" }}>Enter your image meme idea and generate nutty images!</p>
        <p style={{ fontSize: "0.9rem", color: "#8B572A", fontStyle: "italic", marginBottom: "1.5rem" }}>
          AI powered by Venice AI
        </p>
        <div style={{ margin: "20px 0", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter meme idea"
            style={{
              padding: "12px",
              width: "60%",
              maxWidth: "400px",
              border: "1px solid #D4A676",
              borderRadius: "6px",
              fontSize: "1rem",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
            disabled={isProcessing}
          />
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            style={{
              padding: "12px",
              border: "1px solid #D4A676",
              borderRadius: "6px",
              fontSize: "1rem",
              backgroundColor: "#FFF8E1",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
            disabled={isProcessing}
          >
            <option value="kawaii">Kawaii</option>
            <option value="cursed">Cursed</option>
          </select>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              padding: "12px",
              border: "1px solid #D4A676",
              borderRadius: "6px",
              fontSize: "1rem",
              backgroundColor: "#FFF8E1",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
            disabled={isProcessing}
          >
            <option value="flux-dev">Flux Dev</option>
            <option value="stable-diffusion-3.5">Stable Diffusion 3.5</option>
            <option value="fluently-xl">Fluently XL</option>
          </select>
          <button
            onClick={handleGenerateMemes}
            disabled={isProcessing}
            style={{
              padding: "12px 24px",
              backgroundColor: isProcessing ? "#B5A89F" : "#8B572A",
              color: "#FFF",
              border: "none",
              borderRadius: "6px",
              cursor: isProcessing ? "not-allowed" : "pointer",
              fontSize: "1rem",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.3s ease",
            }}
          >
            {isProcessing ? "Generating..." : "NUTIFY"}
          </button>
        </div>
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={handleClear}
            style={{
              padding: "12px 24px",
              backgroundColor: "#D4A676",
              color: "#FFF",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "1rem",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.3s ease",
            }}
          >
            Clear
          </button>
        </div>
        {peanutoshiComment && (
          <div style={{ marginTop: "20px", textAlign: "left", maxWidth: "60%", margin: "20px auto", backgroundColor: "#FFF8E1", padding: "20px", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#5D4037", marginBottom: "1rem" }}>Peanutoshi Says:</h2>
            {peanutoshiThinking && (
              <p style={{
                background: "#F4E3B2", // Softer yellow for better readability
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "10px",
                fontWeight: "normal", // Avoid bold for better readability
                color: "#3E2723", // Darker text color for contrast
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}>
                <strong>Thinking:</strong> <span style={{ fontStyle: "italic" }}>{peanutoshiThinking}</span>
              </p>
            )}
            <p style={{ fontStyle: "italic", color: "#5D4037" }}>{peanutoshiComment}</p>
          </div>
        )}
        {imageUrl && (
          <div style={{ marginTop: "20px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#5D4037", marginBottom: "1rem" }}>Your Nutty Image</h2>
            <img src={imageUrl} alt="Nutty Meme" style={{ maxWidth: "100%", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default NutinoMemes;
