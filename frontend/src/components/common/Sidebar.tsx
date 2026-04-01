"use client"
import React from 'react';
import { LayoutDashboard, Users, MessageSquare, History, Settings, LogOut, BarChart3, Video, PlayCircle } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'shorts', label: 'Shorts Analyzer', icon: <PlayCircle size={20} /> },
    { id: 'video', label: 'Video Analyzer', icon: <Video size={20} /> },
    { id: 'channel', label: 'Channel Stats', icon: <BarChart3 size={20} /> },
    { id: 'chat', label: 'AI Strategy Lab', icon: <MessageSquare size={20} /> },
    { id: 'history', label: 'Project History', icon: <History size={20} /> },
  ];

  return (
    <aside className="glass" style={{ 
      width: '260px', 
      height: 'calc(100vh - 40px)', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '20px',
      marginRight: '20px',
      position: 'sticky',
      top: '20px'
    }}>
      <div style={{ marginBottom: '40px', paddingLeft: '10px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>
          Shorts <span className="title-gradient">Pro</span>
        </h2>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === item.id ? 'var(--surface)' : 'transparent',
              color: activeTab === item.id ? 'var(--accent)' : 'var(--text-dim)',
              textAlign: 'left',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
            className={activeTab === item.id ? 'shimmer' : ''}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '12px 16px', 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text-dim)',
          fontSize: '0.9rem' 
        }}>
          <Settings size={20} /> Settings
        </button>
        <button style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '12px 16px', 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--retention-critical)',
          fontSize: '0.9rem' 
        }}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}
