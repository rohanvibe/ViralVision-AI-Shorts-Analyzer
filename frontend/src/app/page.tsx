"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, Video, BarChart2, MessageSquare, History, Settings, Loader2, Wand2 } from 'lucide-react';
import Sidebar from '@/components/common/Sidebar';
import VideoUploader from '@/components/dashboard/VideoUploader';
import FeedbackPanel from '@/components/dashboard/FeedbackPanel';
import RetentionChart from '@/components/dashboard/RetentionChart';
import ChatAssistant from '@/components/dashboard/ChatAssistant';
import { analyzeVideo, analyzeUrl, AnalysisReport } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [activeTab, setActiveTab] = useState('shorts');
  const [projectHistory, setProjectHistory] = useState<any[]>([]);
  const [channelData, setChannelData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [channelUrl, setChannelUrl] = useState('');

  const handleAnalyzeFromUrl = async (url: string) => {
    setIsAnalyzing(true);
    setActiveTab('shorts');
    setReport(null); // Clear previous
    try {
      const data = await analyzeUrl(url);
      setReport(data);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Fetch history when tab changes
  useEffect(() => {
    if (activeTab === 'history') {
      axios.get(`${API_BASE_URL}/history`).then((res: any) => setProjectHistory(res.data));
    }
  }, [activeTab]);

  const handleChannelAnalyze = async () => {
    if (!channelUrl) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('channel_url', channelUrl);
      const res = await axios.post(`${API_BASE_URL}/analyze-channel`, formData);
      setChannelData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryProject = async (taskId: string) => {
    const res = await axios.get(`${API_BASE_URL}/report/${taskId}`);
    setReport(res.data);
    setActiveTab('shorts');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'shorts':
      case 'video':
        const isShorts = activeTab === 'shorts';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {isAnalyzing ? (
              <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 className="glass" 
                 style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              >
                 <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ marginBottom: '24px' }}
                 >
                    <Loader2 size={48} color="var(--accent)" />
                 </motion.div>
                 <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>AI <span className="title-gradient">Deep Scanning</span></h2>
                 <p style={{ color: 'var(--text-dim)', marginTop: '10px' }}>Extracting retention data & audiovisual peaks...</p>
              </motion.div>
            ) : !report ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass" 
                style={{ 
                  height: 'calc(100vh - 80px)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: isShorts 
                    ? 'radial-gradient(circle at center, rgba(0, 243, 255, 0.05) 0%, transparent 70%)'
                    : 'radial-gradient(circle at center, rgba(112, 0, 255, 0.05) 0%, transparent 70%)'
                }}
              >
                <div style={{ textAlign: 'center', maxWidth: '600px', marginBottom: '40px' }}>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '16px' }}>
                    {isShorts ? 'Viral' : 'Professional'} <span className="title-gradient">{isShorts ? 'Shorts' : 'Video'} AI</span>
                  </h1>
                  <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>
                    {isShorts 
                      ? "Analyze your hook, pacing, and viral potential specifically for 60s vertical content."
                      : "Deep analytical overview of your long-form content, identifying engagement leaks and pacing."}
                  </p>
                </div>
                <VideoUploader onReport={(r) => { setReport(r); }} />
              </motion.div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) 1fr', gap: '24px', animation: 'fadeIn 0.5s ease-out' }}>
                {/* Left Column: Player & Chat */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="glass" style={{ height: '600px', background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                    <video 
                      src={`${API_BASE_URL}${report.video_url}`} 
                      controls 
                      autoPlay 
                      loop 
                      style={{ height: '100%', width: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <ChatAssistant taskId={report.task_id} />
                </div>

                {/* Right Column: Feedback & Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Analysis <span className="title-gradient">Dashboard</span></h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="glass" onClick={() => window.open(`${API_BASE_URL}/export-csv/${report.task_id}`)} style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={16} /> Data Export
                      </button>
                      <button className="glass" onClick={() => setReport(null)} style={{ padding: '10px 18px', fontSize: '0.85rem' }}>Analyze New</button>
                    </div>
                  </div>

                  <FeedbackPanel report={report} />
                  
                  <div className="glass" style={{ padding: '24px', minHeight: '350px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: 'var(--accent)' }}>Retention Flow Engine</h3>
                    <RetentionChart report={report} />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'channel':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '30px', minHeight: '80vh' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px' }}>Channel <span className="title-gradient">Analyzer Lab</span></h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Deep-scan a channel to analyze technical performance across its library.</p>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
              <input 
                type="text" 
                placeholder="YouTube Channel URL" 
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                className="glass" 
                style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }} 
              />
              <button 
                onClick={handleChannelAnalyze}
                disabled={loading}
                className="shimmer" 
                style={{ padding: '16px 30px', borderRadius: '12px', background: 'var(--accent)', color: '#000', fontWeight: '800' }}
              >
                {loading ? 'Scanning Channel...' : 'Run Lab Analysis'}
              </button>
            </div>

            {channelData && (
              <div style={{ animation: 'fadeIn 0.5s' }}>
                <h3 style={{ marginBottom: '20px' }}>Results for: {channelData.channel_title}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                  {channelData.videos.map((vid: any, idx: number) => (
                    <div key={idx} className="glass" style={{ padding: '15px' }}>
                      <img src={vid.thumbnail} style={{ width: '100%', borderRadius: '8px', marginBottom: '10px' }} />
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vid.title}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Views: {vid.view_count || 'N/A'}</span>
                        <span>{vid.duration}s</span>
                      </div>
                      <button 
                         className="shimmer" 
                         onClick={() => handleAnalyzeFromUrl(vid.url)}
                         style={{ marginTop: '15px', width: '100%', fontSize: '0.8rem', padding: '10px', borderRadius: '8px', background: 'var(--accent)', color: '#000', fontWeight: '800' }}
                      >
                         Deep Retention Analysis
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );

      case 'chat':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '30px', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                 <MessageSquare color="var(--accent)" />
                 <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>AI Strategy <span className="title-gradient">Consultant</span></h2>
              </div>
              <p style={{ color: 'var(--text-dim)' }}>Your project context for {report?.task_id || "global library"} is active.</p>
            </div>
            <div style={{ flex: 1 }}>
              <ChatAssistant taskId={report?.task_id || "global"} />
            </div>
          </motion.div>
        );

      case 'history':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '30px', minHeight: '80vh' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '24px' }}>Project <span className="title-gradient">History</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {projectHistory.length === 0 ? (
                <div className="glass" style={{ padding: '50px', textAlign: 'center', color: 'var(--text-dim)', gridColumn: '1 / -1' }}>
                  No recent analyses found in the vault.
                </div>
              ) : (
                projectHistory.map((proj: any) => (
                  <div key={proj.task_id} className="glass" style={{ padding: '20px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--accent)' }}>
                      {proj.video_name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '10px', opacity: 0.5 }}>ID: {proj.task_id}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{proj.hook_score}% Hook</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{proj.duration}s video</span>
                    </div>
                    <button 
                       onClick={() => loadHistoryProject(proj.task_id)}
                       className="shimmer" 
                       style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--secondary)', fontWeight: 'bold' }}
                    >
                       Reload Analysis
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', background: 'var(--background)', padding: '20px', color: '#fff' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
       <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
        {renderContent()}
      </div>
    </main>
  );
}
