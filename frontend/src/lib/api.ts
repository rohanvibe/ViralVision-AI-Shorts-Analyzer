import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AnalysisReport {
  task_id: string;
  video_url: string;
  analysis: {
    duration: number;
    motion: { timestamp: number; intensity: number }[];
    cuts: number[];
    audio: { timestamp: number; amplitude: number }[];
    peaks: number[];
  };
  report: {
    hook_score: number;
    engagement_score: number;
    insights: {
      type: string;
      text: string;
      color: string;
    }[];
    suggestions: string[];
  };
}

export const analyzeVideo = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // 1. Upload
  const uploadRes = await axios.post(`${API_BASE_URL}/upload`, formData);
  const { task_id, file_path, video_name } = uploadRes.data;
  
  // 2. Run analysis
  const analyzeFormData = new FormData();
  analyzeFormData.append('file_path', file_path);
  analyzeFormData.append('video_name', video_name);
  const runRes = await axios.post(`${API_BASE_URL}/run-analysis/${task_id}`, analyzeFormData);
  
  return runRes.data as AnalysisReport;
};

export const analyzeUrl = async (url: string) => {
  const formData = new FormData();
  formData.append('url', url);
  
  // 1. Download
  const downloadRes = await axios.post(`${API_BASE_URL}/analyze-url`, formData);
  const { task_id, file_path, video_name } = downloadRes.data;
  
  // 2. Run analysis
  const analyzeFormData = new FormData();
  analyzeFormData.append('file_path', file_path);
  analyzeFormData.append('video_name', video_name);
  const runRes = await axios.post(`${API_BASE_URL}/run-analysis/${task_id}`, analyzeFormData);
  
  return runRes.data as AnalysisReport;
};

export const getReport = async (taskId: string) => {
  const res = await axios.get(`${API_BASE_URL}/report/${taskId}`);
  return res.data as AnalysisReport;
};

export const askChat = async (taskId: string, query: string) => {
  const formData = new FormData();
  formData.append('query', query);
  const res = await axios.post(`${API_BASE_URL}/chat/${taskId}`, formData);
  return res.data.response as string;
};
