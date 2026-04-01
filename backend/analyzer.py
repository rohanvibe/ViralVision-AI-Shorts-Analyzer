import cv2
import numpy as np
import librosa
import os
from moviepy import VideoFileClip

class VideoAnalyzer:
    def __init__(self, file_path):
        self.file_path = file_path
        self.cap = cv2.VideoCapture(file_path)
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.duration = self.total_frames / self.fps if self.fps > 0 else 0

    def analyze_motion_and_cuts(self):
        """
        Detects motion intensity and scene cuts using histogram difference.
        Returns: (motion_scores, scene_cuts)
        """
        motion_scores = []
        scene_cuts = []
        prev_hist = None
        
        # We sample at 2 FPS for speed and efficiency
        sample_interval = max(1, int(self.fps / 2))
        
        frame_idx = 0
        while self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                break
            
            if frame_idx % sample_interval == 0:
                # Convert to gray and resize for faster processing
                small_frame = cv2.resize(frame, (320, 180))
                gray = cv2.cvtColor(small_frame, cv2.COLOR_BGR2GRAY)
                
                # Histogram for cut detection
                hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
                cv2.normalize(hist, hist)
                
                if prev_hist is not None:
                    # Difference for motion score
                    diff = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_CORREL)
                    motion_intensity = 1.0 - diff # Higher value = more motion/change
                    motion_scores.append({
                        "timestamp": round(frame_idx / self.fps, 2),
                        "intensity": float(motion_intensity)
                    })
                    
                    # Cut detection: lower correlation = scene change
                    if diff < 0.7:
                        scene_cuts.append(round(frame_idx / self.fps, 2))
                
                prev_hist = hist
            
            frame_idx += 1
            
        self.cap.release()
        return motion_scores, scene_cuts

    def analyze_audio(self):
        """
        Extracts waveform, peak data, and identifies SFX-heavy moments.
        """
        # Load audio from video file using moviepy to avoid NoBackendError
        temp_audio = self.file_path + ".wav"
        video = VideoFileClip(self.file_path)
        video.audio.write_audiofile(temp_audio, fps=22050)
        video.close()
        
        y, sr = librosa.load(temp_audio, sr=22050)
        
        # Cleanup
        if os.path.exists(temp_audio):
            os.remove(temp_audio)
        
        # Audio energy (RMS)
        rms = librosa.feature.rms(y=y)[0]
        times = librosa.frames_to_time(range(len(rms)), sr=sr)
        
        # Normalize and resample for visual display
        normalized_rms = rms / (np.max(rms) if np.max(rms) > 0 else 1)
        
        audio_data = []
        # Downsample for graph (2 data points per second)
        step = max(1, int(len(normalized_rms) / (self.duration * 2)))
        for i in range(0, len(normalized_rms), step):
            audio_data.append({
                "timestamp": round(times[i], 2),
                "amplitude": float(normalized_rms[i])
            })
            
        # Detect impactful peaks (SFX or loud moments)
        peaks = []
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        peak_indices = librosa.util.peak_pick(onset_env, pre_max=7, post_max=7, pre_avg=7, post_avg=7, delta=0.5, wait=30)
        peak_times = librosa.frames_to_time(peak_indices, sr=sr)
        
        for t in peak_times:
            peaks.append(round(t, 2))
            
        return audio_data, peaks

def get_complete_analysis(video_path):
    analyzer = VideoAnalyzer(video_path)
    motion, cuts = analyzer.analyze_motion_and_cuts()
    audio, peaks = analyzer.analyze_audio()
    
    return {
        "duration": round(analyzer.duration, 2),
        "motion": motion,
        "cuts": cuts,
        "audio": audio,
        "peaks": peaks
    }
