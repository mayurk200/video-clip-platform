# ClipForge AI — CHANGE IMPACT MAP

> Generated: 2026-06-23

---

## Critical Files (HIGH RISK — breaks multiple features)

### `backend/src/config/database.js`
- **Impact**: EVERYTHING — every service, every route, every controller
- **Risk**: 🔴 CRITICAL
- **Reason**: All data persistence flows through this file. Synchronous writes to disk.
- **Dependents**: auth.service, video.service, clip.service, analytics.controller, videoProcessor.worker, clipGenerator.worker, auth.middleware

### `backend/src/config/index.js`
- **Impact**: All backend services — port, JWT, Redis, AI service URL, storage paths
- **Risk**: 🔴 CRITICAL
- **Dependents**: app.js, auth.service, auth.middleware, processing.service, storage.js, redis.js, logger.js, rateLimiter

### `backend/src/app.js`
- **Impact**: Entire backend API — middleware chain, route mounting
- **Risk**: 🔴 CRITICAL
- **Dependents**: index.js (server startup)

### `frontend/src/services/api.js`
- **Impact**: All frontend API calls — base URL, auth token, interceptors
- **Risk**: 🔴 CRITICAL
- **Dependents**: videoService, clipService, settings.service

### `python-ai-service/app/config.py`
- **Impact**: All Python AI processing — API keys, model selection, FFmpeg paths
- **Risk**: 🔴 CRITICAL
- **Dependents**: Every Python module calls get_settings()

### `storage/db.json`
- **Impact**: All data — users, videos, clips, transcripts, processing jobs
- **Risk**: 🔴 CRITICAL (data loss)
- **Note**: No backup mechanism. Entire file rewritten on every mutation.

### `storage/settings.json`
- **Impact**: All settings — subtitle style, AI model, export config, color grading
- **Risk**: 🟡 MEDIUM
- **Dependents**: Backend settings.js, Python config.py, Frontend Settings page

---

## Service Boundary Files (MEDIUM RISK)

### `backend/src/services/processing.service.js`
- **Impact**: All AI processing — transcription, analysis, clip generation, rendering
- **Risk**: 🟠 HIGH
- **Reason**: This is the bridge between Node.js and Python. Changing endpoints/payloads breaks the pipeline.
- **Dependents**: videoProcessor.worker, clipGenerator.worker

### `backend/src/queues/workers/videoProcessor.worker.js`
- **Impact**: Entire video processing pipeline (4 steps)
- **Risk**: 🟠 HIGH
- **Dependents**: videoProcessing.queue → video.controller.upload

### `backend/src/services/video.service.js`
- **Impact**: Video CRUD, status tracking, retry logic, stuck job recovery
- **Risk**: 🟠 HIGH
- **Dependents**: video.controller, videoProcessor.worker, index.js (startup recovery)

### `python-ai-service/app/ffmpeg/clipper.py`
- **Impact**: All clip cutting, reframing, subtitle embedding
- **Risk**: 🟠 HIGH
- **Key Function**: cut_and_reframe() — the production clip generation pipeline

### `python-ai-service/app/groq/prompts.py`
- **Impact**: Quality of all AI outputs — viral scoring, hook generation, subtitle styling
- **Risk**: 🟠 HIGH
- **Note**: Prompt changes affect clip selection quality, title generation, and subtitle styling

### `python-ai-service/app/transcription/service.py`
- **Impact**: All transcription — both Groq API and local Whisper
- **Risk**: 🟠 HIGH
- **Note**: Transcription is step 1 of the pipeline; if it breaks, nothing else works

---

## Frontend Impact Chains

### `frontend/src/App.jsx`
- **Impact**: All routing — changing routes breaks navigation
- **Risk**: 🟡 MEDIUM
- **Dependents**: main.jsx

### `frontend/src/store/videoSlice.js`
- **Impact**: Video list, upload, processing status polling
- **Risk**: 🟡 MEDIUM
- **Dependents**: Upload, Home, DropzoneUploader, Sidebar (processing count)

### `frontend/src/store/clipSlice.js`
- **Impact**: Clip list, clip detail, rendering, exporting
- **Risk**: 🟡 MEDIUM
- **Dependents**: Clips, ClipDetail, useClips hook

### `frontend/src/index.css`
- **Impact**: All visual styling — design tokens, component classes
- **Risk**: 🟡 MEDIUM
- **Note**: CSS variable changes cascade to every component

### `frontend/src/components/layout/MainLayout.jsx`
- **Impact**: App shell — sidebar, topnav, keyboard shortcuts
- **Risk**: 🟡 MEDIUM
- **Dependents**: App.jsx (wraps all routes)

---

## Low Risk Files (isolated changes)

### Individual Page Files (Home, Upload, Clips, ClipDetail, Analytics, Settings, NotFound)
- **Risk**: 🟢 LOW — changes only affect that specific page

### Individual UI Components (Button, Card, Toggle, Badge, Skeleton, EmptyState, KPICard)
- **Risk**: 🟢 LOW — modular, used in few places

### Individual Clip Components (ClipCard, ClipGrid, ExportPanel, ScoreBreakdown)
- **Risk**: 🟢 LOW — self-contained

### Python Renderers (blur_renderer, smart_renderer, split_renderer)
- **Risk**: 🟢 LOW — isolated rendering modes

### Backend Utils (logger, responseHelper, fileUtils, validators)
- **Risk**: 🟢 LOW — utility functions

### Motion Tracker
- **Risk**: 🟢 NONE — not used in any pipeline

---

## Cross-Service Change Impacts

| If you change... | Also check... |
|-----------------|---------------|
| Backend API routes | Frontend service files (api.js, videoService, clipService) |
| Backend response format | Frontend stores (videoSlice, clipSlice), frontend pages |
| Python API routes | Backend processing.service.js |
| Python clip output format | Backend clipService.createMany field mapping |
| Settings categories | Backend settings.js defaults, Python config.py mapping, Frontend Settings.jsx tabs |
| Database schema (db.json collections) | Backend database.js Collection names, all services |
| Storage folder structure | Backend upload.middleware.js, video.controller.uploadLocal, Python clipper.py |
| Env variables | Backend config/index.js, Python .env/.config.py, Frontend VITE_* in api.js |
