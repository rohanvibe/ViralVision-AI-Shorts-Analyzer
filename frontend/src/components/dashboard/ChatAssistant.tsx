"use client"
import React, { useState } from 'react';
import { MessageCircle, Send, Loader2, User, Bot } from 'lucide-react';
import { askChat } from '@/lib/api';

interface ChatAssistantProps {
  taskId: string;
}

export default function ChatAssistant({ taskId }: ChatAssistantProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: "I've analyzed your video metrics. Ask me anything about the retention patterns!" }
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const userMsg = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await askChat(taskId, userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I lost the connection to the analysis engine." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-assistant glass" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '15px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <MessageCircle size={18} color="var(--accent)" />
        <h3 style={{ fontSize: '0.9rem' }}>Retention AI Co-Pilot</h3>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ 
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            display: 'flex',
            gap: '8px',
            flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
          }}>
            <div style={{ 
              padding: '10px 14px', 
              borderRadius: '12px',
              background: m.role === 'user' ? 'var(--secondary)' : 'rgba(255,255,255,0.05)',
              fontSize: '0.85rem',
              lineHeight: '1.4'
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Loader2 size={16} className="animate-spin" color="var(--accent)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Analyzing context...</span>
          </div>
        ) }
      </div>

      <form onSubmit={handleSend} style={{ padding: '15px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Ask about your retention..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="glass"
          style={{ 
            flex: 1, 
            padding: '10px', 
            background: 'transparent', 
            border: 'none', 
            outline: 'none',
            fontSize: '0.85rem'
          }}
        />
        <button type="submit" style={{ padding: '8px', borderRadius: '8px', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
