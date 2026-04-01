"use client"
import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { analyzeVideo, analyzeUrl, AnalysisReport } from '@/lib/api';

interface UploaderProps {
  onReport: (report: AnalysisReport) => void;
}

export default function VideoUploader({ onReport }: UploaderProps) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    try {
      const report = await analyzeVideo(file);
      onReport(report);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload failed. Please check your video file.");
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !url.trim()) {
      setError("Please paste a link first.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Use a slightly longer timeout for yt-dlp processing
      const report = await analyzeUrl(url.trim());
      onReport(report);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || "Failed to download YouTube video. The server might be busy or the link is restricted.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploader glass shimmer" style={{ padding: '60px', textAlign: 'center', width: '100%', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Shorts <span className="title-gradient">Analyzer Pro</span></h2>
      <p style={{ color: 'var(--text-dim)', marginBottom: '40px' }}>Enhance your retention with AI-driven motion & audio analysis.</p>

      {error && (
        <div style={{ background: 'var(--retention-critical)', color: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '20px' }}>
          <Loader2 className="animate-spin" size={48} color="var(--accent)" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '20px', fontSize: '1.1rem' }}>Analyzing retention patterns...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'center' }}>
          <label className="upload-box glass" style={{ cursor: 'pointer', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <Upload size={32} color="var(--accent)" />
            <span>Upload MP4</span>
            <input type="file" accept="video/mp4" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>

          <form onSubmit={handleUrlSubmit} className="url-box glass" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <LinkIcon size={32} color="var(--secondary)" />
            <input 
              type="text" 
              placeholder="Paste YouTube Link" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
            <button type="submit" className="glass" style={{ padding: '10px 20px', width: '100%', background: 'var(--secondary)' }}>Analyze URL</button>
          </form>
        </div>
      )}
    </div>
  );
}
