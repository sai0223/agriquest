import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AIChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: user?.role === 'FARMER'
        ? '👨‍🌾 Hi! I\'m your AgriAdvisor. Describe your crop issue and I\'ll help diagnose it.'
        : '🌱 Hi! I\'m AgriBot. Ask me anything about farming — soil, irrigation, pests, or crops!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  if (!user) return null;

  const send = async () => {
    if (!input.trim() || loading) return;
    const query = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: query }]);
    setLoading(true);
    try {
      const res = await aiAPI.chat(user.id, query);
      setMessages(m => [...m, { role: 'ai', text: res.data.response }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', text: '⚠️ Unable to reach the AI assistant. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🤖</span>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {user.role === 'FARMER' ? 'AgriAdvisor' : 'AgriBot'}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)' }}>
                  {user.role === 'FARMER' ? 'Diagnostic Mode' : 'Learning Mode'}
                </div>
              </div>
            </div>
            <button className="btn-ghost btn btn-sm" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.role}`}>{m.text}</div>
            ))}
            {loading && (
              <div className="chat-message ai" style={{ animation: 'pulse 1s infinite' }}>
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask a farming question..."
              style={{ fontSize: '0.85rem' }}
            />
            <button className="btn btn-primary btn-sm" onClick={send} disabled={loading}>
              ➤
            </button>
          </div>
        </div>
      )}

      <button
        className="chat-toggle"
        onClick={() => setOpen(o => !o)}
        title="AI Farming Assistant"
      >
        {open ? '✕' : '🤖'}
      </button>
    </div>
  );
}
