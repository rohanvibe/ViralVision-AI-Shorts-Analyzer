"use client"
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AnalysisReport } from '@/lib/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RetentionChartProps {
  report: AnalysisReport;
}

export default function RetentionChart({ report }: RetentionChartProps) {
  const { motion, audio, cuts } = report.analysis;
  const labels = motion.map((m: { timestamp: number }) => m.timestamp.toFixed(1) + 's');
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Motion Intensity',
        data: motion.map((m: { intensity: number }) => m.intensity),
        borderColor: '#00f2fe',
        backgroundColor: 'rgba(0, 242, 254, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'Audio Amplitude',
        data: audio.map((a: { amplitude: number }) => a.amplitude),
        borderColor: '#7000ff',
        backgroundColor: 'rgba(112, 0, 255, 0.05)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderDash: [5, 5],
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8', font: { size: 12 } }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b' },
        min: 0,
        max: 1,
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }
      }
    },
  };

  return (
    <div style={{ height: '300px', width: '100%', padding: '20px' }} className="glass">
      <h3 style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#94a3b8' }}>Visual & Audio Engagement</h3>
      <div style={{ height: '240px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
