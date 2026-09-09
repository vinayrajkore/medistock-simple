// Chatbot.jsx - Rule-based Chatbot Page
// User types a question → backend answers using inventory data

import { useState, useRef, useEffect } from 'react'
import Sidebar from '../components/Sidebar'

function Chatbot() {
  const user = JSON.parse(localStorage.getItem('medistock_user'))

  // Messages array - each message is { text, sender: 'user' | 'bot' }
  const [messages, setMessages] = useState([
    {
      text: `👋 Hello ${user.name}! I'm MediBot, your pharmacy assistant.\nAsk me anything about your medicines, stock, customers, or sales!`,
      sender: 'bot'
    }
  ])

  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)

  // Auto-scroll chat window to bottom when new message arrives
  const chatEndRef = useRef(null)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send a message
  async function sendMessage(text) {
    const msg = text || input.trim()
    if (!msg) return

    // Add user message to chat
    setMessages(prev => [...prev, { text: msg, sender: 'user' }])
    setInput('')
    setLoading(true)

    try {
      const res  = await fetch('/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, user_id: user.user_id })
      })
      const data = await res.json()

      // Add bot reply
      setMessages(prev => [
        ...prev,
        { text: data.success ? data.answer : 'Sorry, something went wrong.', sender: 'bot' }
      ])
    } catch (err) {
      setMessages(prev => [...prev, { text: 'Cannot reach server.', sender: 'bot' }])
    }

    setLoading(false)
  }

  // Suggestion buttons
  const suggestions = [
    'How many medicines do I have?',
    'Show low stock medicines',
    'Show expired medicines',
    'Total sales',
    'How many customers?',
    'Give me a summary'
  ]

  return (
    <div className="layout">
      <Sidebar />

      <main className="content">
        <h1 className="page-title">🤖 MediBot – Inventory Assistant</h1>

        <div style={{ maxWidth: '680px' }}>
          {/* Suggestion Buttons */}
          <p className="text-muted mb-8">Try asking:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
            {suggestions.map((s, i) => (
              <button key={i} className="btn btn-outline btn-sm" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="chat-window">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.sender}`}>
                {m.text}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && <div className="msg bot">...</div>}

            {/* Invisible div to scroll to */}
            <div ref={chatEndRef} />
          </div>

          {/* Input Row */}
          <div className="chat-input-row">
            <input
              type="text"
              placeholder="Type your question and press Enter..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Chatbot
