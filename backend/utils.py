import yt_dlp
import uuid
import os
import requests
import string
import random
import imageio_ffmpeg

def download_youtube_short(url, output_dir):
    """
    Downloads a YouTube Short (or any YT video) to the specified directory.
    Restricts duration to ~60 seconds.
    """
    task_id = str(uuid.uuid4())[:8]
    output_path = os.path.join(output_dir, f"{task_id}.mp4")
    
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': output_path,
        'max_filesize': 50 * 1024 * 1024, # 50MB limit
        'match_filter': yt_dlp.utils.match_filter_func('duration < 120'),
        'ffmpeg_location': imageio_ffmpeg.get_ffmpeg_exe(),
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            ydl.download([url])
            return task_id, output_path
        except Exception as e:
            print(f"Error downloading: {e}")
            return None, None

def generate_task_id():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))

def cleanup_old_files(directory, max_age_seconds=3600):
    """
    Optional: Clean up files older than 1 hour.
    """
    import time
    now = time.time()
    for f in os.listdir(directory):
        fpath = os.path.join(directory, f)
        if os.path.isfile(fpath) and os.stat(fpath).st_mtime < now - max_age_seconds:
            os.remove(fpath)
            print(f"Cleaned up {fpath}")
