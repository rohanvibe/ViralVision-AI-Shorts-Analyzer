# 🎥 ViralVision AI: Shorts Analyzer Pro

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)

**Stop Guessing, Start Going Viral.** ViralVision AI is a high-performance content strategy dashboard that uses Computer Vision and ML to dissect viral potential in 60 seconds or less.

---

## ✨ Features

- **🚀 Viral Hook Detector**: Analyzes the first 3 seconds of your video for visual intensity and pattern interrupts.
- **📊 Dynamic Retention Heatmap**: Interactive Chart.js visualization of predicted engagement dips.
- **🤖 AI Strategy Lab**: A context-aware chatbot that gives you actionable segment-by-segment advice.
- **🎧 Audio-Visual Sync**: Identifies missing "whooshes" or transitions where audio peaks don't match visual cuts.
- **📂 Channel Efficiency Lab**: Scan any YouTube channel to benchmark consistency and library performance.
- **💾 Project Vault**: Persistent history of all your analyses for iterative improvement.

---

## 🛠️ Technology Stack

| Component | Technology | Use Case |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15, Framer Motion | High-end Glassmorphism UI & UX |
| **Backend** | FastAPI (Python 3.12+) | High-performance async API |
| **CV Engine** | OpenCV, NumPy | Motion intensity & scene change detection |
| **Audio Engine** | Librosa, Libsndfile | Spectrogram analysis & peak detection |
| **Data** | JSON + SQLite (Optional) | Report persistence and metadata |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- [FFmpeg](https://ffmpeg.org/download.html) (Essential for video processing)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment Instructions

### Frontend (Vercel)
1. Fork this repository.
2. Connect your GitHub to Vercel.
3. Set the Root Directory to `frontend`.
4. Add `NEXT_PUBLIC_API_URL` to your Vercel Environment Variables.

### Backend (Render / Railway)
1. Create a new Web Service.
2. Connect the repository and set the Root Directory to `backend`.
3. Set the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.

---

## 🎨 UI Preview
*Premium Glassmorphism Dashboard with real-time AI feedback loops.*

---

## 📝 License
MIT License - Developed by Rohan & ViralVision Team.
