import React, { useState, useEffect } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";

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

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { text: input, timestamp: new Date(), sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    const tempId = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: tempId, text: "Sending...", timestamp: new Date(), sender: 'bot' },
    ]);
    setInput('');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama-3.3-70b",
          messages: [{ role: 'user', content: userMessage.text }],
          venice_parameters: {
            enable_web_search: "auto",
            include_venice_system_prompt: true,
            character_slug: "archon-01v",
          },
          ...customSettings,
          stream: false,
        }),
      });
      const data = await response.json();
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, text: data.reply || 'No reply available.' }
            : msg
        )
      );
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, text: "Unable to process your request. Please try again." }
            : msg
        )
      );
    }
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const newSettings = {
      frequency_penalty: parseFloat(form.frequency_penalty.value),
      presence_penalty: parseFloat(form.presence_penalty.value),
      repetition_penalty: parseFloat(form.repetition_penalty.value),
      temperature: parseFloat(form.temperature.value),
      max_tokens: parseInt(form.max_tokens.value),
      max_temp: parseFloat(form.max_temp.value),
      min_temp: parseFloat(form.min_temp.value),
      max_completion_tokens: parseInt(form.max_completion_tokens.value),
      top_k: parseInt(form.top_k.value),
      top_p: parseFloat(form.top_p.value),
      min_p: parseFloat(form.min_p.value),
      stop: form.stop.value,
      stop_token_ids: form.stop_token_ids.value.split(',').map(Number),
    };
    setCustomSettings(newSettings);
    setShowSettings(false);
  };

  return (
    <>
      <Header />
      <main>
        <h1>Chat with our Peanutoshi</h1>
        <div className="chat-container">
          <div className="chat-header">
            <img src="/img/peanutoshi.png" alt="Peanutoshi" className="avatar" />
            <h1>Peanutoshi NUTkamoto</h1>
            <button
              id="settings-btn"
              onClick={() => setShowSettings(true)}
              title="Click to adjust advanced Venice API parameters"
              style={{ marginLeft: 'auto' }}
            >
              Nutty Settings
            </button>
          </div>
          <div className="chat-messages" id="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                <img
                  src={msg.sender === 'user' ? '/img/user.png' : '/img/peanutoshi.png'}
                  alt={msg.sender === 'user' ? 'User Avatar' : 'Peanutoshi'}
                  className="message-avatar"
                />
                <div className="message-content">{msg.text}</div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>

        {showSettings && (
          <div id="settings-modal" style={{ display: 'block' }}>
            <h2>Nutty Settings</h2>
            <form id="settings-form" onSubmit={handleSettingsSubmit}>
              {/* ...existing settings form fields... */}
              <button type="submit">Save Settings</button>
              <button type="button" id="close-settings" onClick={() => setShowSettings(false)}>Close</button>
            </form>
            <p style={{ fontSize: '0.9em', color: '#4a2f1d' }}>
              Hover over each label for more information about the setting.
            </p>
          </div>
        )}

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
          .chat-input button:hover {
            background: #6d4321;
          }
          #settings-modal {
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%);
            background: #f9f3e6;
            border: 1px solid #d4a676;
            padding: 20px;
            z-index: 1000;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(139, 89, 43, 0.1);
          }
          #settings-modal h2 {
            color: #4a2f1d;
          }
          #settings-modal form label {
            display: block;
            margin-bottom: 10px;
          }
          #settings-modal button {
            margin-right: 10px;
          }
        `}</style>
      </main>
      <Footer />
    </>
  );
};

export default Chat;
