# ClipForge AI — FEATURE MAP

> Generated: 2026-06-23

---

## Core Pipeline Features

### Video Upload
- **Status**: ✅ Complete
- **Files**: DropzoneUploader.jsx, Upload.jsx, useUpload.js, videoService.js, video.controller.js, upload.middleware.js, video.service.js
- **Flow**: Drag-drop or local path → Multer saves to storage/{name}_{id}/original/ → DB record created → processing job queued
- **Supports**: MP4, WebM, MOV, AVI, MKV up to 2GB

### Transcription
- **Status**: ✅ Complete
- **Files**: transcription/service.py, transcription/models.py, routes/transcription.py
- **Modes**: Groq Whisper API (default, 50-100x faster) | Local Faster-Whisper (CPU fallback)
- **Features**: Word-level timestamps, auto-chunking for files >25MB (10min chunks), language detection
- **Owner**: Python AI service

### Viral Scoring & Analysis
- **Status**: ✅ Complete
- **Files**: scoring/viral_scorer.py, scoring/clip_ranker.py, scoring/models.py, groq/prompts.py, groq/client.py, routes/analysis.py
- **Flow**: Transcript → Groq LLM identifies viral moments → Weighted ranking → Top N clips
- **Scoring Weights**: hook 0.25, emotion 0.20, curiosity 0.20, shareability 0.15, retention 0.20
- **Title Pipeline**: 5-step process within prompt (extract → generate 20 → rank → score → output best + 3 alternatives)

### Clip Generation (FFmpeg)
- **Status**: ✅ Complete
- **Files**: ffmpeg/clipper.py, ffmpeg/ass_generator.py, routes/clips.py
- **Pipeline**: Single-pass FFmpeg: seek → crop → scale → color grade → ASS subtitles → output
- **Concurrency**: ThreadPoolExecutor, max 4 workers
- **Timeout**: 300s per clip

### AI Subtitle Styling
- **Status**: ✅ Complete
- **Files**: ffmpeg/ass_generator.py, groq/prompts.py (AI_SUBTITLES_*)
- **Flow**: Raw word timestamps → Groq LLM → Punchy phrases with animations + color highlights → ASS file
- **Animations**: pop, bounce, fade, slide (max 25% animated)
- **Highlights**: cyan (numbers), yellow (hooks), red (urgent), green (success)
- **Fallback**: Local word-chunking if AI fails

### AI Color Grading
- **Status**: ✅ Complete
- **Files**: ffmpeg/clipper.py (cut_and_reframe), ffmpeg/ass_generator.py
- **Scene Categories**: Educational, Motivational, Tech, Podcast
- **Applied via**: FFmpeg eq filter (contrast, saturation, brightness, gamma)

### Vertical Reframing
- **Status**: ✅ Complete
- **Files**: reframing/vertical_reframer.py, reframing/decision_engine.py, reframing/face_tracker.py, reframing/renderers/*.py
- **Modes**: blur_background (0 faces), smart_crop (1 face), split_screen (2+ faces)
- **Detection**: OpenCV Haar cascades, MediaPipe face detection (optional)

### AI Hook Generation
- **Status**: ✅ Prompts defined, NOT called in main pipeline
- **Files**: groq/prompts.py (HOOK_GENERATION_*, HOOK_BATCH_*)
- **Hook Types**: Curiosity, Controversial, Emotional, Authority, Story
- **Note**: Hooks are generated AS PART of viral analysis (generated_hook field), but standalone hook endpoint is not exposed in routes

### Overlay Title Generation
- **Status**: ✅ Complete
- **Files**: groq/prompts.py (thumbnail_text in VIRAL_ANALYSIS), ffmpeg/ass_generator.py (overlay title rendering)
- **Rules**: 2-6 words, displayed for first 3 seconds, pop animation

---

## UI/UX Features

### Dashboard (Home)
- **Status**: ✅ Complete
- **Files**: Home.jsx, KPICard.jsx
- **Features**: 4 KPI cards (videos, clips, avg score, queue), processing banner, top clips grid, activity timeline

### Sidebar Navigation
- **Status**: ✅ Complete
- **Files**: Sidebar.jsx, MainLayout.jsx, uiSlice.js
- **Features**: Collapsible, keyboard shortcut `[`, persisted state, processing queue widget

### Command Palette
- **Status**: ✅ Complete
- **Files**: CommandPalette.jsx, uiSlice.js
- **Features**: Ctrl+K, search filter, 8 actions, keyboard navigation

### Clip Gallery
- **Status**: ✅ Complete
- **Files**: Clips.jsx, ClipGrid.jsx, ClipCard.jsx
- **Features**: Sortable (score/duration/date), hover-to-play, responsive grid

### Clip Detail
- **Status**: ✅ Complete
- **Files**: ClipDetail.jsx, ScoreBreakdown.jsx, ExportPanel.jsx
- **Features**: Video player, metadata, hook display, 5-category score bars, 4-platform export

### Analytics Dashboard
- **Status**: ✅ Complete
- **Files**: Analytics.jsx
- **Features**: KPI cards, score distribution, top performers table, summary stats

### Settings Panel
- **Status**: ✅ Complete
- **Files**: Settings.jsx
- **Features**: 7 tabs (video, subtitles, titles, grading, AI, export, storage), live save

### Upload Page
- **Status**: ✅ Complete
- **Files**: Upload.jsx, DropzoneUploader.jsx
- **Features**: Drag-drop + local path, clip count selector, pipeline progress, video list

---

## Auth Features

### Backend Auth (JWT)
- **Status**: ✅ Backend implemented, ❌ Frontend NOT implemented
- **Files**: auth.service.js, auth.routes.js, auth.controller.js, auth.middleware.js
- **Note**: Auth middleware is BYPASSED — grabs first user from DB

### Login/Register Pages
- **Status**: ❌ Not implemented
- **Files**: None
- **Dependency**: Needs auth.middleware.js to be un-bypassed first

---

## Planned / Incomplete Features

| Feature | Status | Notes |
|---------|--------|-------|
| Login/Register UI | ❌ Planned | Backend ready, no frontend pages |
| Light Mode | ❌ Planned | CSS variables support it |
| PostgreSQL Migration | ❌ Planned | README references Prisma, not implemented |
| Clip Download | ❌ Broken | Frontend calls `/clips/:id/download` — no backend route |
| Caption Editor | ❌ Broken | Frontend calls `/clips/:id/captions` — no backend route |
| Thumbnail Editor | ❌ Broken | Frontend calls `/clips/:id/thumbnail` — no backend route |
| Render Clip (from UI) | ⚠️ Placeholder | Backend returns success message but doesn't trigger processing |
| Export Clip (from UI) | ⚠️ Placeholder | Backend returns success message but doesn't trigger processing |
| Real-time Processing Updates | ❌ Planned | WebSocket URL configured in .env but not implemented |
| BullMQ Queue | ❌ Unused | Redis connected, BullMQ not used (local processing instead) |
