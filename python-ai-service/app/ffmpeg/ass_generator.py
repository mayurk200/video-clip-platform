import os
import json
import re
from app.utils.logger import get_logger
from app.groq.client import chat_completion
from app.groq.prompts import AI_SUBTITLES_SYSTEM, AI_SUBTITLES_USER

logger = get_logger(__name__)

def format_ass_time(seconds: float) -> str:
    """Format time to ASS format: H:MM:SS.cs (centiseconds)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    cs = int(round((seconds % 1) * 100))
    if cs >= 100:
        cs = 99
    return f"{hours}:{minutes:02d}:{secs:02d}.{cs:02d}"

def ai_stylize_subtitles(words: list) -> tuple:
    """Use AI to convert raw words into punchy phrases and determine scene category."""
    try:
        if not words:
            return [], "Educational"
            
        raw_text = "\n".join([f"[{w.get('start', 0):.1f}-{w.get('end', 0):.1f}] {w.get('word', '')}" for w in words])
        user_prompt = AI_SUBTITLES_USER.format(raw_words=raw_text)
        
        logger.info(f"Generating smart subtitles for {len(words)} words via Groq...")
        response_text = chat_completion(AI_SUBTITLES_SYSTEM, user_prompt, json_mode=True)
        data = json.loads(response_text)
        
        captions = data.get("captions", [])
        scene_category = data.get("scene_category", "Educational")
        
        if not captions:
            raise ValueError("AI returned empty captions list")
            
        captions = enforce_pacing_and_quality(captions)
        return captions, scene_category
    except Exception as e:
        logger.warning(f"AI subtitle styling failed: {e}. Falling back to local logic.")
        return fallback_stylize_subtitles(words), "Educational"

def fallback_stylize_subtitles(words: list) -> list:
    """Fallback logic to chunk words into basic phrase blocks if AI fails."""
    captions = []
    current_chunk = []
    
    for i, w in enumerate(words):
        if not current_chunk:
            current_chunk.append(w)
            continue
            
        prev_w = current_chunk[-1]
        pause = w.get("start", 0) - prev_w.get("end", 0)
        
        if len(current_chunk) >= 5 or pause > 0.8:
            captions.append(_build_fallback_caption(current_chunk))
            current_chunk = [w]
        else:
            current_chunk.append(w)
            
    if current_chunk:
        captions.append(_build_fallback_caption(current_chunk))
        
    return enforce_pacing_and_quality(captions)

def _build_fallback_caption(chunk: list) -> dict:
    text = " ".join([w.get("word", "") for w in chunk])
    start = chunk[0].get("start", 0)
    end = chunk[-1].get("end", 0)
    return {
        "text": text,
        "start": start,
        "end": end,
        "animation": "none",
        "highlights": []
    }

def enforce_pacing_and_quality(captions: list) -> list:
    """Enforce minimum readability durations, 250ms gaps, and animation density max 25%."""
    if not captions:
        return []

    # 1. Enforce minimum durations and overlaps
    for i in range(len(captions)):
        cap = captions[i]
        word_count = len(cap.get("text", "").split())
        
        # Calculate minimum readability duration
        min_duration = 0.8
        if word_count >= 5 and word_count <= 8:
            min_duration = 1.5
        elif word_count >= 9:
            min_duration = 2.5
            
        duration = cap["end"] - cap["start"]
        if duration < min_duration:
            cap["end"] = cap["start"] + min_duration
            
        # Enforce 250ms gap before the NEXT caption
        if i < len(captions) - 1:
            next_cap = captions[i + 1]
            if cap["end"] > next_cap["start"] - 0.25:
                cap["end"] = next_cap["start"] - 0.25
                # If forcing a gap made this caption too short, push the next caption forward
                if (cap["end"] - cap["start"]) < min_duration:
                    cap["end"] = cap["start"] + min_duration
                    next_cap["start"] = cap["end"] + 0.25

    # 2. Enforce Animation Density (< 25% animated)
    animated_indices = [i for i, c in enumerate(captions) if c.get("animation", "none") != "none"]
    max_animated = max(1, int(len(captions) * 0.25))
    
    if len(animated_indices) > max_animated:
        # Downgrade animations that are not 'pop' (keep 'pop' as highest priority)
        # or just downgrade the last ones until we meet the quota
        for idx in animated_indices[max_animated:]:
            captions[idx]["animation"] = "none"

    return captions

def get_color_code(color_name: str) -> str:
    color_name = color_name.lower()
    if color_name == "cyan":
        return r"{\c&HFFFF00&}"
    elif color_name == "yellow":
        return r"{\c&H00FFFF&}"
    elif color_name == "red":
        return r"{\c&H0000FF&}"
    elif color_name == "green":
        return r"{\c&H00FF00&}"
    return ""

def get_animation_tag(anim_name: str) -> str:
    anim_name = anim_name.lower()
    if anim_name == "pop":
        return r"{\t(0,150,\fscx110\fscy110)\t(150,300,\fscx100\fscy100)}"
    elif anim_name == "bounce":
        return r"{\fscx50\fscy50\t(0,200,\fscx120\fscy120)\t(200,350,\fscx100\fscy100)}"
    elif anim_name == "fade":
        return r"{\fad(200,200)}"
    elif anim_name == "slide":
        return r"{\fad(200,200)\fscy0\t(0,200,\fscy100)}"
    return ""

def generate_ass_file(words: list, output_path: str, overlay_title: str = "") -> tuple:
    """
    Generate an ASS subtitle file and return the scene_category for FFmpeg grading.
    Returns: (ass_path, scene_category)
    """
    captions, scene_category = ai_stylize_subtitles(words)
    
    # Dynamic styling based on scene category
    outline = 8
    shadow = 6
    if scene_category == "Motivational":
        outline = 10
        shadow = 8
    elif scene_category == "Tech":
        outline = 9
        shadow = 5
        
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial Black,90,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,{outline},{shadow},2,40,40,250,1
Style: OverlayTitle,Arial Black,100,&H0000FFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,{outline},{shadow},8,40,40,250,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(header)
        
        if overlay_title:
            overlay_clean = overlay_title.replace("'", "").replace('"', '').strip()
            anim_tag = get_animation_tag("pop")
            f.write(f"Dialogue: 0,0:00:00.00,0:00:03.00,OverlayTitle,,0,0,0,,{anim_tag}{overlay_clean}\\N\n")
        
        for cap in captions:
            start_ass = format_ass_time(cap.get("start", 0))
            end_ass = format_ass_time(cap.get("end", 0))
            text = cap.get("text", "")
            
            # Strip stray XML tags if the LLM hallucinates them
            text = re.sub(r"<[^>]+>", "", text)
            
            anim_tag = get_animation_tag(cap.get("animation", "none"))
            
            highlights = cap.get("highlights", [])
            for h in highlights:
                word = h.get("word", "")
                color = h.get("color", "")
                if word and color:
                    color_tag = get_color_code(color)
                    if color_tag:
                        escaped_word = re.escape(word)
                        text = re.sub(fr"\b({escaped_word})\b", lambda m: f"{color_tag}{m.group(1)}{{\\c}}", text, flags=re.IGNORECASE)
            
            line_text = f"{anim_tag}{text}"
            f.write(f"Dialogue: 0,{start_ass},{end_ass},Default,,0,0,0,,{line_text}\n")
    
    return output_path, scene_category
