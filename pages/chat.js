import React, { useState } from 'react';
import Header from '../components/Header'; // Import Header
import Footer from '../components/Footer'; // Import Footer

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false); // Track sending status
    const [isTyping, setIsTyping] = useState(false); // Typing indicator

    const sendMessage = async () => {
        if (!input.trim() || isSending) return;

        setIsSending(true);
        const userMessage = { role: 'user', content: input };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        try {
            setIsTyping(true); // Show typing indicator
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'default',
                    messages: [...messages, userMessage],
                    venice_parameters: {
                        character_slug: 'alan-watts'
                    },
                }),
            });
            const data = await response.json();
            const botMessage = { role: 'bot', content: data.reply || 'No reply available.' };
            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsSending(false);
            setIsTyping(false); // Hide typing indicator
        }

        setInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <>
            <Header /> {/* Add Header */}
            <div className="chat-container">
                <div className="chat-header">
                    <img src="/img/peanutoshi.png" alt="Peanutoshi" className="avatar" />
                    <h1>Chat with Peanutoshi</h1>
                </div>
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <div className="message-content">{msg.content}</div>
                        </div>
                    ))}
                    {isTyping && <div className="typing-indicator">Peanutoshi is typing...</div>}
                </div>
                <div className="chat-input">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                    />
                    <button onClick={sendMessage} disabled={isSending}>Send</button>
                </div>
            </div>
            <Footer /> {/* Add Footer */}
        </>
    );
};

export default Chat;
