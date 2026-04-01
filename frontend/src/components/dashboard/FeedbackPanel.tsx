"use client"
import React from 'react';
import { AlertCircle, CheckCircle, Info, Lightbulb, Wand2 } from 'lucide-react';
import { AnalysisReport } from '@/lib/api';

interface FeedbackPanelProps {
  report: AnalysisReport;
}

export default function FeedbackPanel({ report }: FeedbackPanelProps) {
  const { hook_score, engagement_score, insights, suggestions } = report.report;

  const getColor = (color: string) => {
    switch (color) {
      case 'critical': return 'var(--retention-critical)';
      case 'warning': return 'var(--retention-warning)';
      case 'suggestion': return 'var(--accent)';
      case 'info': return 'var(--text-dim)';
      default: return 'var(--accent)';
    }
  };

  const getIcon = (color: string) => {
    switch (color) {
      case 'critical': return <AlertCircle size={20} />;
      case 'warning': return <Info size={20} />;
      case 'suggestion': return <Lightbulb size={20} />;
      default: return <CheckCircle size={20} />;
    }
  };

  return (
    <div className="feedback-panel glass" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={{ textAlign: 'center', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Hook Score</p>
          <h2 style={{ fontSize: '2rem', color: hook_score > 70 ? 'var(--retention-positive)' : 'var(--retention-warning)' }}>{hook_score}%</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Engagement</p>
          <h2 style={{ fontSize: '2rem', color: engagement_score > 70 ? 'var(--retention-positive)' : 'var(--retention-warning)' }}>{engagement_score}%</h2>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb size={18} color="var(--accent)" />
          Retention AI Insights
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {insights.map((insight, idx) => (
            <div 
              key={idx} 
              className="glass" 
              style={{ 
                padding: '15px', 
                borderLeft: `3px solid ${getColor(insight.color)}`,
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}
            >
              <span style={{ color: getColor(insight.color) }}>{getIcon(insight.color)}</span>
              <p>{insight.text}</p>
            </div>
          ))}
          {insights.length === 0 && (
            <div className="glass" style={{ padding: '15px', textAlign: 'center', color: 'var(--text-dim)' }}>
              No critical issues detected. Solid visual flow!
            </div>
          )}
        </div>

        {suggestions && suggestions.length > 0 && (
          <div style={{ marginTop: '25px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
              <Wand2 size={18} />
              Recommended Edits
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {suggestions.map((suggestion: string, idx: number) => (
                <div key={idx} className="glass" style={{ padding: '12px', fontSize: '0.85rem', border: '1px dashed var(--accent)', color: 'rgba(255,255,255,0.9)' }}>
                  ✨ {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
