import React, { useState, useEffect } from 'react';
import Layout from "../components/Layout";
import ReactMarkdown from 'react-markdown'; // Install this library using `npm install react-markdown`

const defaultSettings = {
  frequency_penalty: 0,
  presence_penalty: 0,
  repetition_penalty: 1.2,
  temperature: 0.7,
  max_tokens: 123,
  max_temp: 1.5,
  min_temp: 0.1,
  max_completion_tokens: 123,
  top_k: 40,
  top_p: 0.9,
  min_p: 0.05,
  stop: "<string>",
  stop_token_ids: [151643, 151645],
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [customSettings, setCustomSettings] = useState(defaultSettings);
  const [isProcessing, setIsProcessing] = useState(false); // Track if the bot is processing

  const prepackagedPrompts = [
    {
      label: "🌰 Based Nut Ecosystem",
      prompt: "Tell me about the Based Nut ecosystem and its unique value proposition. What is a NUT (Network Utility Token) and how does it differ from other tokens?",
    },
    {
      label: "🔍 Peanutoshi Nutkamoto Engine",
      prompt: "What is the Peanutoshi Nutkamoto Engine, and how does it predict liquidity shifts using the Fear & Greed index from CoinMarketCap and data DeFiLlamas TVL tides? How can Peanutoshi help me navigate the DeFi seas?",
    },
    {
      label: "📊Crack the Market",
      prompt: "What is the current state of the market according to all sources? What does the current NSI say and does the Nutrbitrage Detector sniff BASE-chain alpha? Include references when applicable",
    },
  ];

  const handlePrepackagedPrompt = (prompt) => {
    setInput(prompt);
    handleSendMessage();
  };

  useEffect(() => {
    fetch('/api/chat')
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok: " + res.status);
        }
        return res.json();
      })
      .then((data) => setMessages(data))
      .catch((err) => console.error("Error fetching chat messages:", err));
  }, []);

  const parseResponse = (reply) => {
    // Use the dotAll flag (s) to capture multiple lines if necessary.
    const thinkRegex = /<think>(.*?)<\/think>/gs;
    let match;
    let chainOfThought = [];
    while ((match = thinkRegex.exec(reply)) !== null) {
        chainOfThought.push(match[1].trim());
    }
    // Remove all chain-of-thought content from the final reply text.
    const cleanedReply = reply.replace(thinkRegex, '').trim();
    return { cleanedReply, chainOfThought };
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return; // Prevent sending if processing
    const userMessage = { text: input, timestamp: new Date(), sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    const tempId = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: tempId, text: "Sending...", timestamp: new Date(), sender: 'bot' },
    ]);
    setInput('');
    setIsProcessing(true); // Disable sending while processing
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Let server select/sanitize model
          messages: [{ role: 'user', content: userMessage.text }],
          venice_parameters: {
            enable_web_search: "auto",
            include_venice_system_prompt: false,
            character_slug: "peanutoshi-nutkamoto",
          },
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const { cleanedReply, chainOfThought } = parseResponse(data.reply || 'No reply available.');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, text: cleanedReply, thinking: chainOfThought }
            : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, text: "Failed to send message. Please try again later." }
            : msg
        )
      );
    } finally {
      setIsProcessing(false); // Ensure processing is reset after completion
    }

    // Timeout to handle cases where the bot takes too long to respond
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, text: "The bot is taking too long to respond. Please try again later." }
            : msg
        )
      );
      setIsProcessing(false); // Reset processing state
    }, 120000); // 2 minutes
  };

  return (
    <Layout>
      <main>
        <div className="brand-box">
          <h1>Chat with our Peanutoshi</h1>
          <div className="brand-buttons">
            <a href="https://venice.ai/c/peanutoshi-nutkamoto" target="_blank" rel="noopener noreferrer" className="brand-button">
              Visit Peanutoshi on Venice
            </a>
            <a href="https://chatgpt.com/g/g-6738c69da52081919865912b625a2448-peanutoshi-nutkamoto" target="_blank" rel="noopener noreferrer" className="brand-button">
              Explore Peanutoshi on ChatGPT
            </a>
          </div>
        </div>
        <div className="chat-container">
          <div className="chat-header">
            <img src="/img/peanutoshi.png" alt="Peanutoshi" className="avatar" />
            <h1>Peanutoshi NUTkamoto</h1>
          </div>
          <div className="chat-messages" id="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                <img
                  src={msg.sender === 'user' ? '/img/user.png' : '/img/peanutoshi.png'}
                  alt={msg.sender === 'user' ? 'User Avatar' : 'Peanutoshi'}
                  className="message-avatar"
                />
                <div className="message-content">
                  {msg.sender === 'bot' ? (
                    <>
                      {msg.thinking && msg.thinking.length > 0 && (
                        <div className="thinking">
                          <strong>Peanutoshi's Thought Process:</strong>
                          {msg.thinking.map((thought, i) => (
                            <p key={i}><i>{thought}</i></p>
                          ))}
                        </div>
                      )}
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="thinking-indicator">
                <span>🤔 Peanutoshi is thinking...</span>
              </div>
            )}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              placeholder="Type your message..."
              disabled={isProcessing} // Disable input while processing
            />
            <button onClick={handleSendMessage} disabled={isProcessing}>Send</button>
          </div>
          <div className="brand-buttons">
            {prepackagedPrompts.map((prompt, index) => (
              <button
                key={index}
                className="brand-button"
                onClick={() => handlePrepackagedPrompt(prompt.prompt)}
                disabled={isProcessing}
              >
                {prompt.label}
              </button>
            ))}
          </div>
          <p className="ai-warning">
            ⚠️ Reminder: AI-generated responses may contain inaccuracies or fabricated links. Always verify the information provided.
          </p>
          <p className="powered-by">Chat powered by Venice AI</p>
        </div>

        <style jsx global>{`
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #f9f3e6;
          }
          .chat-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(139, 89, 43, 0.1);
          }
          .chat-header {
            display: flex;
            align-items: center;
            padding: 20px;
            background-color: #d4a676;
            border-radius: 12px 12px 0 0;
          }
          .avatar {
            width: 50px;
            height: 50px;
            border-radius: 25px;
            margin-right: 15px;
          }
          .chat-header h1 {
            color: #4a2f1d;
            margin: 0;
            font-size: 24px;
          }
          .chat-messages {
            height: 400px;
            overflow-y: auto;
            padding: 20px;
          }
          .message {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
          }
          .message-avatar {
            width: 30px;
            height: 30px;
            border-radius: 15px;
            margin-right: 10px;
          }
          .message-content {
            background: #f0e6d9;
            padding: 12px;
            border-radius: 12px;
            max-width: 70%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .message.user .message-avatar {
            border: 2px solid #a97142;
          }
          .message.user .message-content {
            background: #fff8e1;
            border-radius: 12px 12px 0 12px;
          }
          .message.bot .message-content {
            border-radius: 12px 12px 12px 0;
          }
          .chat-input {
            display: flex;
            padding: 20px;
            border-top: 1px solid #e0d5c1;
          }
          .chat-input input {
            flex: 1;
            padding: 12px;
            border: 1px solid #d4a676;
            border-radius: 6px;
            margin-right: 10px;
          }
          .chat-input button {
            padding: 12px 24px;
            background: #8b572a;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          .chat-input button:disabled {
            background: #d4a676;
            cursor: not-allowed;
          }
          .chat-input button:hover:not(:disabled) {
            background: #6d4321;
          }
          .thinking {
            margin-bottom: 10px;
            padding: 10px;
            background: #f9f3e6;
            border-left: 4px solid #d4a676;
            font-style: italic;
            color: #6d4321;
          }
          .thinking-indicator {
            text-align: center;
            margin-top: 10px;
            font-style: italic;
            color: #a97142;
          }
          .powered-by {
            text-align: center;
            font-size: 12px;
            color: #a97142;
            margin-top: 10px;
            font-style: italic;
          }
          .brand-box {
            text-align: center;
            background-color: #f0e6d9;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(139, 89, 43, 0.1);
          }
          .brand-box h1 {
            margin: 0 0 10px;
            font-size: 24px;
            color: #4a2f1d;
          }
          .brand-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 10px;
          }
          .brand-button {
            padding: 12px 24px;
            background-color: #8b572a;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s ease;
          }
          .brand-button:disabled {
            background-color: #d4a676;
            cursor: not-allowed;
          }
          .brand-button:hover:not(:disabled) {
            background-color: #6d4321;
          }
          .ai-warning {
            text-align: center;
            font-size: 14px;
            color: #a97142;
            margin-top: 20px;
            font-style: italic;
          }
        `}</style>
      </main>
    </Layout>
  );
};

export default Chat;
