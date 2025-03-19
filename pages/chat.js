import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ChatPage() {
  return (
    <div>
      <Header />
      <main className="chat-content">
        <iframe
          src="/chat.html"
          style={{ width: '100%', height: '800px', border: 'none' }}
        />
      </main>
      <Footer />
    </div>
  );
}
