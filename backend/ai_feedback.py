import os
import json

class EngagementAI:
    def __init__(self, analysis_data):
        self.data = analysis_data
        self.duration = analysis_data["duration"]
        self.motion = analysis_data["motion"]
        self.cuts = analysis_data["cuts"]
        self.audio = analysis_data["audio"]
        self.peaks = analysis_data["peaks"]

    def calculate_hook_score(self):
        """
        Analyzes the first 3 seconds for engagement.
        Hook Score: 0-100
        """
        score = 0
        
        # Check first 3s motion
        first_3s_motion = [m["intensity"] for m in self.motion if m["timestamp"] <= 3]
        if first_3s_motion:
            avg_motion = sum(first_3s_motion) / len(first_3s_motion)
            score += min(avg_motion * 100, 40) # Max 40 points for motion
            
        # Check for early patterns
        first_3s_cuts = [c for c in self.cuts if c <= 3]
        if len(first_3s_cuts) >= 1:
            score += 30 # Points for early pattern interrupt
            
        # Check for early audio peak
        first_1_5s_peaks = [p for p in self.peaks if p <= 1.5]
        if first_1_5s_peaks:
            score += 30 # Points for audio hook
            
        return round(score, 1)

    def calculate_engagement_score(self):
        """
        Analyzes the overall flow of the video.
        Engagement Score: 0-100
        """
        score = 0
        
        # Consistent activity: motion > 0.2
        active_segments = [m for m in self.motion if m["intensity"] > 0.15]
        activity_ratio = len(active_segments) / (len(self.motion) if len(self.motion) > 0 else 1)
        score += activity_ratio * 40 # Max 40 points for consistent movement
        
        # Scene Density (aim for 1 cut every 3-5s)
        ideal_cuts = self.duration / 4
        actual_cuts = len(self.cuts)
        score += min((actual_cuts / max(1, ideal_cuts)) * 30, 30) # Max 30 points for cut density
        
        # Audio-Visual Alignment (SFX during transitions)
        alignment_bonus = 0
        for cut in self.cuts:
            # Check if any peak is within 0.2s of a cut
            if any(abs(p - cut) < 0.2 for p in self.peaks):
                alignment_bonus += 5
        
        score += min(alignment_bonus, 30) # Max 30 points for sync
        
        return round(score, 1)

    def generate_feedback_insights(self):
        """
        Generates human-readable feedback based on the analysis.
        """
        insights = []
        
        # Check hook
        if not any(c <= 1.5 for c in self.cuts) and not any(p <= 1 for p in self.peaks):
            insights.append({
                "type": "retention_risk",
                "text": "Hook at 0-1.5s is weak: low motion & no audio cue found. Add an impactful SFX or a faster visual transition.",
                "color": "critical"
            })
            
        # Check for long static scenes
        for i in range(len(self.cuts) - 1):
            if self.cuts[i+1] - self.cuts[i] > 5:
                insights.append({
                    "type": "editing_suggestion",
                    "text": f"Pattern interrupt recommended around {round(self.cuts[i] + 2.5, 1)}s. The scene stays static for over 5 seconds.",
                    "color": "warning"
                })
        
        # Audio sync check
        missed_sync = []
        for cut in self.cuts:
            if not any(abs(p - cut) < 0.25 for p in self.peaks):
                missed_sync.append(cut)
        
        if missed_sync:
            first_fail = missed_sync[0]
            insights.append({
                "type": "audio_matching",
                "text": f"Audio peak missing on visual transition at {round(first_fail, 1)}s. Consider adding a 'woosh' or 'pop' sound effect here.",
                "color": "suggestion"
            })
            
        if self.calculate_hook_score() < 50:
            insights.append({
                "type": "general",
                "text": "Overall hook is sluggish. Retention might drop in the first 2 seconds. Try zooming in/out at the start.",
                "color": "info"
            })
            
        return insights

    def recommend_edits(self):
        """
        Recommends specific edits for the video.
        """
        edits = []
        
        # 1. Pattern Interrupts
        all_cuts = sorted(self.cuts)
        last_cut = 0
        for cut in all_cuts:
            if cut - last_cut > 4.5:
                edits.append(f"Add a zoom-in or screen overlay at {round(last_cut + 2.2, 1)}s to break the visual monotony.")
            last_cut = cut
            
        # 2. Thumbnail Recommendation (highest motion + peak)
        best_time = 0
        best_val = 0
        for m in self.motion:
            # Score each timestamp based on motion and proximity to audio peak
            val = m["intensity"]
            if any(abs(p - m["timestamp"]) < 0.5 for p in self.peaks):
                val += 0.5 # Extra weight for audio-visual alignment
            
            if val > best_val:
                best_val = val
                best_time = m["timestamp"]
        
        edits.append(f"Best thumbnail candidate found at {round(best_time, 1)}s. Highly dynamic frame with audio alignment.")
        
        # 3. Audio Hook
        if not any(p < 1.0 for p in self.peaks):
             edits.append("Add a 'Whoosh' or 'Glitch' SFX at 0.5s to grab auditory attention immediately.")
             
        return edits


def get_retention_report(analysis_data, use_llm=False):
    engine = EngagementAI(analysis_data)
    
    hook_score = engine.calculate_hook_score()
    engagement_score = engine.calculate_engagement_score()
    insights = engine.generate_feedback_insights()
    suggestions = engine.recommend_edits()
    
    return {
        "hook_score": hook_score,
        "engagement_score": engagement_score,
        "insights": insights,
        "suggestions": suggestions
    }
