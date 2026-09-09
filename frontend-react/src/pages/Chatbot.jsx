import { useState, useRef, useEffect } from 'react';
import { getSession, chatbotReply } from '../utils/storage';

export default function Chatbot() {
  const session = getSession();
  const [messages, setMessages] = useState([
    { from: 'bot', text: `Hi ${session?.name || 'there'}! 👋 I'm your MediStock assistant. Ask me about your stock, expiry, revenue, or how to use the app!` }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg = { from: 'user', text };
    const reply   = chatbotReply(session.id, text);
    setMessages(prev => [...prev, userMsg, { from: 'bot', text: reply }]);
    setInput('');
  }

  function handleKey(e) { if (e.key === 'Enter') send(); }

  const suggestions = ['How many medicines?', 'Low stock?', 'Expiring soon?', 'Total revenue?'];

  return (
    <div className="page">
      <div className="page-header"><h1>💬 MediStock Assistant</h1></div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.from}`}>
              {m.from === 'bot' && <span className="bot-avatar">🤖</span>}
              <div className="bubble-text">{m.text}</div>
            </div>
          ))}
          <div ref={endRef}/>
        </div>

        {/* Quick suggestions */}
        <div className="chat-suggestions">
          {suggestions.map(s => (
            <button key={s} className="suggestion-btn" onClick={() => { setInput(s); }}>
              {s}
            </button>
          ))}
        </div>

        <div className="chat-input-row">
          <input
            placeholder="Ask something…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button className="btn-primary" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}
