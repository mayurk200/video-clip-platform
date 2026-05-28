"""
Caption style definitions for FFmpeg ASS/SRT rendering.
"""

STYLES = {
    "hormozi": {
        "font_name": "Inter",
        "font_size": 42,
        "font_weight": "Bold",
        "primary_color": "&HFFFFFF",
        "active_color": "&H00D7FF",  # Gold in BGR
        "outline_color": "&H000000",
        "outline_width": 3,
        "alignment": 2,  # Center bottom
        "margin_v": 60,
        "uppercase": True,
    },
    "minimal": {
        "font_name": "Inter",
        "font_size": 32,
        "font_weight": "Medium",
        "primary_color": "&HF6F1F1",
        "active_color": "&HED3A6C",  # Purple in BGR
        "outline_color": "&H00000000",
        "outline_width": 0,
        "alignment": 2,
        "margin_v": 40,
        "uppercase": False,
    },
    "gaming": {
        "font_name": "Inter",
        "font_size": 38,
        "font_weight": "ExtraBold",
        "primary_color": "&H88FF00",
        "active_color": "&HFF00FF",
        "outline_color": "&H000000",
        "outline_width": 2,
        "alignment": 2,
        "margin_v": 50,
        "uppercase": True,
    },
    "podcast": {
        "font_name": "Inter",
        "font_size": 34,
        "font_weight": "SemiBold",
        "primary_color": "&HFFFFFF",
        "active_color": "&HA0D606",  # Emerald in BGR
        "outline_color": "&H00000000",
        "outline_width": 0,
        "alignment": 2,
        "margin_v": 45,
        "uppercase": False,
    },
}
