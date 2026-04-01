from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import shutil
import uuid
import json
from analyzer import get_complete_analysis
from ai_feedback import get_retention_report
from utils import download_youtube_short, generate_task_id

app = FastAPI(title="Shorts Analyzer Pro API")

# Add CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
PROCESSED_DATA_DIR = os.path.join(os.getcwd(), "processed")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)

# Static files for video preview
app.mount("/videos", StaticFiles(directory=UPLOAD_DIR), name="videos")

@app.get("/")
def home():
    return {"message": "Shorts Analyzer Pro API is live."}

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a video.")
        
    task_id = str(uuid.uuid4())[:8]
    ext = os.path.splitext(file.filename)[1] or ".mp4"
    file_path = os.path.join(UPLOAD_DIR, f"{task_id}{ext}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {
        "task_id": task_id,
        "video_url": f"/videos/{task_id}{ext}",
        "file_path": file_path,
        "video_name": file.filename
    }

@app.post("/analyze-url")
def analyze_url(url: str = Form(...)):
    import yt_dlp
    with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
        title = ydl.extract_info(url, download=False).get('title', 'YouTube Video')

    task_id, file_path = download_youtube_short(url, UPLOAD_DIR)
    if not task_id:
        raise HTTPException(status_code=500, detail="Failed to download YouTube video.")
        
    filename = os.path.basename(file_path)
    
    return {
        "task_id": task_id,
        "video_url": f"/videos/{filename}",
        "file_path": file_path,
        "video_name": title
    }

@app.post("/run-analysis/{task_id}")
def run_analysis(task_id: str, file_path: str = Form(...), video_name: str = Form("Untitled Video")):
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video file not found.")
    
    # Run core analysis
    analysis_data = get_complete_analysis(file_path)
    
    # Run AI feedback engine
    report = get_retention_report(analysis_data)
    
    full_report = {
        "task_id": task_id,
        "video_url": f"/videos/{os.path.basename(file_path)}",
        "video_name": video_name,
        "analysis": analysis_data,
        "report": report
    }
    
    # Save for history
    import json
    report_path = os.path.join(PROCESSED_DATA_DIR, f"{task_id}.json")
    with open(report_path, "w") as f:
        json.dump(full_report, f)
        
    return full_report

@app.get("/export-csv/{task_id}")
def export_csv(task_id: str):
    report_path = os.path.join(PROCESSED_DATA_DIR, f"{task_id}.json")
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Report not ready.")
        
    import json
    import csv
    import io
    from fastapi.responses import StreamingResponse
    
    with open(report_path, "r") as f:
        data = json.load(f)
        
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Type", "Timestamp/Value", "Value/Text"])
    writer.writerow(["Hook Score", data["report"]["hook_score"], ""])
    writer.writerow(["Engagement Score", data["report"]["engagement_score"], ""])
    for m in data["analysis"]["motion"]:
        writer.writerow(["Motion", m["timestamp"], m["intensity"]])
    for i in data["report"]["insights"]:
        writer.writerow(["Insight", i["type"], i["text"]])
        
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=shorts_analysis_{task_id}.csv"}
    )

@app.get("/report/{task_id}")
def get_report(task_id: str):
    report_path = os.path.join(PROCESSED_DATA_DIR, f"{task_id}.json")
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Report not ready or missing.")
    
    with open(report_path, "r") as f:
        return json.load(f)

@app.post("/chat/{task_id}")
def chat_with_report(task_id: str, query: str = Form(...)):
    if task_id == "global":
        return {"response": "Hello! I am your Global AI Content Strategist. I can help you with YouTube Shorts psychology, hook design, and overall channel growth. To analyze a specific video, please upload it first in the 'Shorts' or 'Video' tabs!"}

    report_path = os.path.join(PROCESSED_DATA_DIR, f"{task_id}.json")
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Report not ready.")
    with open(report_path, "r") as f:
        data = json.load(f)
    
    # Context stats
    hook = data["report"]["hook_score"]
    eng = data["report"]["engagement_score"]
    motion = data["analysis"]["motion"]
    cuts = data["analysis"]["cuts"]
    peaks = data["analysis"]["peaks"]
    dur = data["analysis"]["duration"]
    
    q = query.lower()
    resp = ""

    # Segment based logic
    if any(k in q for k in ["start", "hook", "begin", "intro"]):
        m_start = [m["intensity"] for m in motion if m["timestamp"] <= 3]
        avg_m = (sum(m_start)/len(m_start)) if m_start else 0
        if avg_m < 0.2:
            resp = f"Your start is visually slow (avg {round(avg_m*100)}% motion). Viewers expect a significant visual change in the first 0.5s."
        elif not any(c <= 1.5 for c in cuts):
            resp = "Your intro is missing an early pattern interrupt. Add a scene cut or a zoom-in within the first 1.5 seconds."
        else:
            resp = f"Visually your intro is solid ({hook}%). Check your audio: do you have a loud curiosity-trigger at the very beginning?"
            
    elif any(k in q for k in ["end", "ending", "conclusion"]):
        resp = f"The ending looks strong with an engagement score of {eng}%. Viewers are finishing the video, which is great for the algorithm."
        
    elif any(k in q for k in ["audio", "sfx", "sound", "music", "sync"]):
        unaligned = [c for c in cuts if not any(abs(p - c) < 0.25 for p in peaks)]
        if unaligned:
            resp = f"I found {len(unaligned)} visual transitions without matching audio SFX (notably at {round(unaligned[0], 1)}s). Adding a 'whoosh' here will increase retention."
        else:
            resp = "Your audio is perfectly synchronized with your visual cuts. Excellent editing!"

    elif any(k in q for k in ["pace", "bore", "slow", "edit"]):
        gaps = [cuts[i+1] - cuts[i] for i in range(len(cuts)-1)]
        long_gap = max(gaps) if gaps else 0
        if long_gap > 4:
            resp = f"The pacing is uneven. You have a {round(long_gap, 1)}s segment without a scene cut. Try a quick zoom-change every 2 seconds."
        else:
            resp = "Your editing pacing is lightning fast! The frequent cuts help keep viewer eyes locked."

    else:
        resp = f"Task {task_id}: Hook {hook}%, overall Engagement {eng}%. Ask about the 'intro', 'ending', or 'audio alignment' for deep insights."

    return {"response": resp}

import yt_dlp

@app.get("/history")
def get_history():
    history = []
    if not os.path.exists(PROCESSED_DATA_DIR):
        return []
        
    for filename in os.listdir(PROCESSED_DATA_DIR):
        if filename.endswith(".json"):
            report_path = os.path.join(PROCESSED_DATA_DIR, filename)
            with open(report_path, "r") as f:
                data = json.load(f)
                history.append({
                    "task_id": data["task_id"],
                    "video_url": data["video_url"],
                    "video_name": data.get("video_name", "Untitled Video"),
                    "hook_score": data["report"]["hook_score"],
                    "duration": data["analysis"]["duration"]
                })
    return history

@app.post("/analyze-channel")
def analyze_channel(channel_url: str = Form(...)):
    """
    Fetches basic metadata for the last 5 videos on a channel's shorts tab.
    """
    if channel_url.startswith("@"):
        channel_url = f"https://www.youtube.com/{channel_url}"
    
    # Target the shorts tab specifically for best results
    if "/shorts" not in channel_url and "/videos" not in channel_url:
        channel_url = channel_url.rstrip("/") + "/shorts"

    ydl_opts = {
        'extract_flat': True, # Flat is faster and enough if directed at the right URL
        'playlist_items': '1-5',
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(channel_url, download=False)
            if 'entries' not in info:
                raise HTTPException(status_code=400, detail="No videos found on this channel.")
            
            videos = []
            for entry in info['entries']:
                if not entry: continue
                # Metadata check with multiple key types for view count
                raw_views = (entry.get('view_count') or 
                            entry.get('viewcount') or 
                            entry.get('views') or 
                            entry.get('view_count_text') or 
                            entry.get('approximate_view_count'))
                
                formatted_views = "N/A"
                if raw_views:
                    try:
                        v_int = int(str(raw_views).replace(",","").replace(" views","")) # Clean text if needed
                        if v_int >= 1000000:
                            formatted_views = f"{round(v_int/1000000, 1)}M"
                        elif v_int >= 1000:
                            formatted_views = f"{round(v_int/1000, 1)}K"
                        else:
                            formatted_views = str(v_int)
                    except:
                        formatted_views = str(raw_views)

                videos.append({
                    "title": entry.get('title'),
                    "url": entry.get('url') or f"https://www.youtube.com/watch?v={entry.get('id')}",
                    "duration": entry.get('duration'),
                    "view_count": formatted_views,
                    "thumbnail": entry.get('thumbnails')[-1]['url'] if entry.get('thumbnails') else f"https://i.ytimg.com/vi/{entry.get('id')}/maxresdefault.jpg"
                })
            
            return {
                "channel_title": info.get('title'),
                "videos": videos
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch channel info: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
