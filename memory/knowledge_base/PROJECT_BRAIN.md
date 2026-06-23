# ClipForge AI — PROJECT BRAIN

> Generated: 2026-06-23 | Total Source Files Indexed: 74 | Status: COMPLETE

---

# AI QUICK START

ClipForge AI is a **3-service full-stack** video clipping platform. Upload a long video → AI transcribes → Groq LLM finds viral moments → FFmpeg cuts 9:16 clips with AI-styled subtitles, face-tracked reframing, and overlay titles.

**Architecture**: React/Vite frontend (:5173) → Express API (:3001) → FastAPI Python AI service (:8000) → FFmpeg/OpenCV/Groq.

**Database**: NOT PostgreSQL. Uses a JSON file (`storage/db.json`, ~7MB). Collections: `users`, `videos`, `clips`, `transcripts`, `processingJobs`.

**Auth**: JWT-based but currently **bypassed** — `auth.middleware.js` just grabs the first user from DB. No frontend login pages.

**Processing Pipeline**: Upload → Transcribe (Groq Whisper or local) → Analyze (Groq LLM viral scoring) → Create clip records → FFmpeg cut+reframe+subtitle in one pass → COMPLETED.

**Key Config**: `storage/settings.json` drives both backend and Python service settings (subtitle style, grading, AI model, export format).

**Frontend**: 7 pages, 12 components, 3 Zustand stores, sidebar+command palette navigation.

---

# FILE INVENTORY

## Root Files

### `.env.example`
- **Path**: `d:\ADCET\projects\main\video_clip\.env.example`
- **Purpose**: Template for all env vars across all 3 services
- **Exports**: N/A (config template)
- **Dependencies**: N/A
- **Known Issues**: References PostgreSQL/Prisma which are NOT actually used

### `.gitignore`
- **Path**: `d:\ADCET\projects\main\video_clip\.gitignore`
- **Purpose**: Git ignore rules

### `README.md`
- **Path**: `d:\ADCET\projects\main\video_clip\README.md`
- **Purpose**: Project overview, tech stack, setup instructions
- **Known Issues**: Lists PostgreSQL and Prisma ORM as the database, but actual implementation uses JSON file

---

## Backend — Node.js Express API (Port 3001)

### `backend/src/index.js`
- **Purpose**: Server entry point. Starts Express, recovers stuck processing jobs on boot
- **Imports**: app.js, config/index.js, utils/logger.js, services/video.service.js
- **Functions**: `shutdown(signal)` — graceful shutdown with 10s timeout
- **Key Behavior**: Calls `videoService.recoverStuckJobs()` on startup

### `backend/src/app.js`
- **Purpose**: Express app setup — middleware chain: helmet → cors → JSON → morgan → rate limiter → routes → error handler
- **Imports**: express, cors, helmet, morgan, config, routes, errorHandler, apiLimiter
- **Exports**: `default app`
- **Key Detail**: BigInt.prototype.toJSON polyfill, CORS allows all origins in dev

### `backend/src/config/index.js`
- **Purpose**: Central config from env vars
- **Exports**: `default config` — { port, nodeEnv, isDev, jwt.{secret,expiresIn}, redis.{host,port,password}, aiService.url, storage.{path,maxUploadSizeMB}, processing.maxConcurrentJobs }
- **Env Vars Used**: PORT, NODE_ENV, JWT_SECRET, JWT_EXPIRES_IN, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, AI_SERVICE_URL, STORAGE_PATH, MAX_UPLOAD_SIZE_MB, MAX_CONCURRENT_JOBS

### `backend/src/config/database.js`
- **Purpose**: JSON file database engine. Reads/writes `storage/db.json`
- **Exports**: `default db` — { users, videos, clips, transcripts, processingJobs } (Collection instances)
- **Classes**: `Collection` — findAll, findOne, count, insert, insertMany, updateOne, upsert, deleteOne, deleteMany
- **Helpers**: `matchesFilter(item, filter)` — supports `{ in: [...] }` operator, `applySort(arr, orderBy)`
- **Key Detail**: Seeds demo user on first load. Writes entire DB to disk on every mutation (synchronous `fs.writeFileSync`)
- **Impact if Modified**: EVERYTHING breaks — every service depends on db

### `backend/src/config/redis.js`
- **Purpose**: IORedis connection for BullMQ
- **Exports**: `default redis` (IORedis instance)
- **Known Issues**: Connection errors are logged but don't crash the server. Redis is imported but BullMQ is NOT used (local processing instead)

### `backend/src/config/storage.js`
- **Purpose**: Resolves absolute paths for storage directories
- **Exports**: `default storage` — { root, uploads, processed, clips, thumbnails }

### `backend/src/config/settings.js`
- **Purpose**: Settings engine — reads/writes `storage/settings.json`, merges with defaults
- **Exports**: `getSettings()`, `updateSettings(updates)`
- **Categories**: video, subtitles, titles, grading, ai, export, storage

---

### `backend/src/api/routes/index.js`
- **Purpose**: Route aggregator — mounts all route modules under /api
- **Mounts**: /auth, /videos, /clips, /analytics, /settings, /health

### `backend/src/api/routes/auth.routes.js`
- **Purpose**: Auth routes with express-validator
- **Routes**: POST /register, POST /login, GET /me, PUT /me
- **Middleware**: authLimiter (POST), authMiddleware (GET/PUT), validate

### `backend/src/api/routes/video.routes.js`
- **Purpose**: Video CRUD + upload + processing routes
- **Routes**: POST /upload, POST /upload-local, GET /, DELETE /, GET /:id, GET /:id/status, POST /:id/retry, DELETE /:id
- **Middleware**: authMiddleware (all), uploadLimiter (POST), uploadVideo (multer)

### `backend/src/api/routes/clip.routes.js`
- **Purpose**: Clip CRUD + render + export routes
- **Routes**: GET /recent, GET /video/:videoId, GET /:id, PUT /:id, DELETE /:id, POST /:id/render, POST /:id/export
- **Middleware**: authMiddleware (all)

### `backend/src/api/routes/analytics.routes.js`
- **Purpose**: Dashboard statistics
- **Routes**: GET /dashboard
- **Middleware**: authMiddleware

### `backend/src/api/routes/settings.routes.js`
- **Purpose**: Settings CRUD (no auth!)
- **Routes**: GET /, PUT /
- **Known Issues**: No authMiddleware — settings are publicly accessible

---

### `backend/src/controllers/auth.controller.js`
- **Purpose**: Auth request handlers
- **Functions**: register, login, getProfile, updateProfile
- **Calls**: authService

### `backend/src/controllers/video.controller.js`
- **Purpose**: Video request handlers. Most complex controller.
- **Functions**: upload, uploadLocal, list, getById, getStatus, deleteVideo, retryVideo, deleteAll
- **Key Logic**: `uploadLocal()` copies file from filesystem path, creates folder structure (original/, clips/, temp/), sanitizes filenames
- **Calls**: videoService, addVideoProcessingJob, storage config

### `backend/src/controllers/clip.controller.js`
- **Purpose**: Clip request handlers
- **Functions**: listByVideo, listRecent, getById, update, deleteClip, renderClip, exportClip
- **Known Issues**: `renderClip` and `exportClip` are **placeholders** — they return success but don't actually trigger rendering

### `backend/src/controllers/analytics.controller.js`
- **Purpose**: Dashboard stats aggregation
- **Functions**: getDashboardStats — computes totalVideos, totalClips, avgViralScore
- **Calls**: db directly (not via service)

### `backend/src/controllers/settings.controller.js`
- **Purpose**: Settings CRUD handler
- **Functions**: getSettingsController, updateSettingsController
- **Calls**: config/settings.js functions

---

### `backend/src/services/auth.service.js`
- **Purpose**: Auth business logic — register, login, profile
- **Functions**: register(name, email, password), login(email, password), getProfile(userId), updateProfile(userId, updates)
- **Dependencies**: bcryptjs, jsonwebtoken, db, config
- **Key Detail**: Hashes passwords with bcrypt (12 rounds), JWT with configurable expiry

### `backend/src/services/video.service.js`
- **Purpose**: Video CRUD + processing orchestration
- **Functions**: create, listByUser, getById, updateStatus, delete, deleteAll, resetForRetry, getProcessingStatus, recoverStuckJobs
- **Key Detail**: `recoverStuckJobs()` marks TRANSCRIBING/ANALYZING/CLIPPING/RENDERING videos as FAILED on restart
- **Status Values**: QUEUED → TRANSCRIBING → ANALYZING → CLIPPING → RENDERING → COMPLETED | FAILED

### `backend/src/services/clip.service.js`
- **Purpose**: Clip CRUD + bulk creation from AI analysis
- **Functions**: listByVideo, listRecent, getById, createMany, update, delete
- **Key Detail**: `createMany()` maps AI analysis fields (title_info.best_title, generated_hook, viral_score, scores.*) to clip records

### `backend/src/services/processing.service.js`
- **Purpose**: HTTP client for Python AI service
- **Functions**: transcribe(videoPath), analyzeTranscript(transcript, videoId, desiredClipCount), generateClips(videoPath, clips, outputDir), renderClip(clipPath, options), healthCheck()
- **Timeouts**: Default 30min, transcribe 90min
- **Key Detail**: Uses `Connection: close` header and keepAlive: false to prevent socket pooling issues

---

### `backend/src/middleware/auth.middleware.js`
- **Purpose**: JWT auth middleware
- **Known Issues**: **BYPASSED** — just grabs first user from DB (`db.users.findOne({})`) instead of verifying JWT token
- **Impact**: Every request appears authenticated as the first user

### `backend/src/middleware/errorHandler.middleware.js`
- **Purpose**: Global Express error handler
- **Handles**: LIMIT_FILE_SIZE (413), Invalid file type (400), generic errors (500)

### `backend/src/middleware/rateLimiter.middleware.js`
- **Purpose**: Rate limiting with express-rate-limit
- **Limiters**: authLimiter (20/15min), apiLimiter (100/1min), uploadLimiter (10/hour)

### `backend/src/middleware/upload.middleware.js`
- **Purpose**: Multer upload config for video files
- **Key Detail**: Creates per-video folder structure: `{baseName}_{shortId}/original/`, `clips/`, `temp/`
- **File filter**: ALLOWED_VIDEO_TYPES from validators
- **Max size**: configurable via MAX_UPLOAD_SIZE_MB

### `backend/src/middleware/validation.middleware.js`
- **Purpose**: express-validator result checker
- **Exports**: `validate` middleware function

---

### `backend/src/queues/videoProcessing.queue.js`
- **Purpose**: Video processing queue (local, NOT BullMQ)
- **Functions**: addVideoProcessingJob(videoId, videoPath), isProcessing(videoId)
- **Key Detail**: Uses in-memory `Set` to track active jobs, prevents duplicate processing, runs async but doesn't await

### `backend/src/queues/clipGeneration.queue.js`
- **Purpose**: Clip rendering queue (local)
- **Functions**: addClipGenerationJob(clipId, options)

### `backend/src/queues/workers/videoProcessor.worker.js`
- **Purpose**: 4-step video processing pipeline orchestrator
- **Steps**: 1. Transcribe → 2. Analyze → 3. Create clip records → 4. Generate clip files (FFmpeg)
- **Pre-flight**: Validates file exists on disk, health-checks AI service
- **Key Detail**: Passes word-level timestamps to clip generation for subtitle synchronization, logs step durations
- **Error Handling**: Any step failure → marks video FAILED with step name in error message

### `backend/src/queues/workers/clipGenerator.worker.js`
- **Purpose**: Individual clip renderer worker
- **Functions**: processClip(jobData) — renders single clip via AI service
- **Status flow**: RENDERING → COMPLETED | FAILED

---

### `backend/src/utils/logger.js`
- **Purpose**: Winston logger — JSON format, colorized console output
- **Exports**: `default logger`

### `backend/src/utils/responseHelper.js`
- **Purpose**: Standardized API response format
- **Exports**: successResponse, errorResponse, paginatedResponse
- **Format**: `{ success: bool, message: string, ...data }`

### `backend/src/utils/fileUtils.js`
- **Purpose**: File system helpers
- **Exports**: ensureDir, safeDelete, getExtension

### `backend/src/utils/validators.js`
- **Purpose**: Validation constants and functions
- **Exports**: ALLOWED_VIDEO_TYPES (mp4, webm, quicktime, x-msvideo, x-matroska), isValidEmail, isValidPassword

---

## Python AI Service — FastAPI (Port 8000)

### `python-ai-service/app/main.py`
- **Purpose**: FastAPI app entry — registers CORS, routes, startup logging
- **Routers**: health, transcription (/api), analysis (/api), clips (/api), render (/api)

### `python-ai-service/app/config.py`
- **Purpose**: Pydantic settings from .env + storage/settings.json
- **Class**: Settings — ai_service_port, groq_api_key, groq_model, whisper_mode/model_size/device/compute_type, ffmpeg/ffprobe_path, storage_path, clip_min/max_duration, top_clips_count
- **Key Detail**: `get_settings()` reads storage/settings.json on every call for live config updates

### `python-ai-service/app/groq/client.py`
- **Purpose**: Groq API client singleton
- **Functions**: get_client() → Groq, chat_completion(system_prompt, user_prompt, json_mode) → str
- **Config**: model from settings, temperature 0.7, max_tokens 4096

### `python-ai-service/app/groq/prompts.py`
- **Purpose**: All AI prompt templates (6 prompts)
- **Prompts**: VIRAL_ANALYSIS_SYSTEM/USER (clip identification + title generation), HOOK_GENERATION_SYSTEM/USER (5 hook types), HOOK_BATCH_SYSTEM/USER (batch hooks), AI_SUBTITLES_SYSTEM/USER (smart captions + scene classification)
- **Key Detail**: Title generation is a 5-step pipeline within the prompt: extract → generate 20 → rank → score → output best + 3 alternatives. Includes overlay_title generation (2-6 words)

### `python-ai-service/app/scoring/models.py`
- **Purpose**: Pydantic model for viral clip data
- **Model**: ViralClip — clip_start, clip_end, viral_score, hook_strength, emotion_score, curiosity_score, shareability_score, retention_score, reason, audience, platform, generated_hook, generated_title, thumbnail_text, hashtags

### `python-ai-service/app/scoring/viral_scorer.py`
- **Purpose**: Sends transcript to Groq for viral moment analysis
- **Function**: analyze_transcript_for_viral_moments(transcript_text, segments) → List[ViralClip]
- **Key Detail**: Truncates transcript to 12,000 chars for context window

### `python-ai-service/app/scoring/clip_ranker.py`
- **Purpose**: Re-ranks clips using weighted scoring formula
- **Weights**: hook_strength 0.25, emotion 0.20, curiosity 0.20, shareability 0.15, retention 0.20
- **Function**: rank_clips(clips, top_n=10) → List[ViralClip]

### `python-ai-service/app/transcription/models.py`
- **Purpose**: Pydantic models for transcription output
- **Models**: Word(word, start, end), Segment(text, start, end, words), TranscriptionResult(full_text, segments, language, language_probability, duration)

### `python-ai-service/app/transcription/service.py`
- **Purpose**: Transcription engine — Groq Whisper API or local Faster-Whisper
- **Functions**: transcribe_video (router), _transcribe_with_groq (primary), _transcribe_chunked_groq (large files, 10min chunks), _transcribe_local (CPU fallback), _extract_audio (FFmpeg → AAC 64kbps 16kHz mono), _parse_groq_response
- **Key Detail**: Files <25MB sent directly to Groq (skips audio extraction). Files >25MB: extract → chunk → transcribe each → merge with time offsets

### `python-ai-service/app/ffmpeg/clipper.py`
- **Purpose**: FFmpeg video processing commands
- **Functions**: cut_clip (precise h264 re-encode), cut_clip_fast (stream copy), normalize_audio (loudnorm), extract_audio (WAV), _get_video_dimensions (ffprobe), cut_and_reframe (SINGLE-PASS cut+crop+grade+subtitle)
- **Key Detail**: `cut_and_reframe()` is the main production function — does seek+crop+scale+color grading+ASS subtitles in one FFmpeg pass. 2x faster than two-step. 300s timeout per clip.

### `python-ai-service/app/ffmpeg/ass_generator.py`
- **Purpose**: AI-powered ASS subtitle file generator
- **Functions**: generate_ass_file(words, output_path, overlay_title) → (ass_path, scene_category), ai_stylize_subtitles(words) → (captions, scene_category), fallback_stylize_subtitles(words), enforce_pacing_and_quality(captions)
- **Key Detail**: Uses Groq to convert raw words into punchy phrases with animation (pop/bounce/fade/slide) and color highlights (cyan/yellow/red/green). Falls back to local chunking if AI fails. Enforces max 25% animated captions, min 0.8s duration, 250ms gaps.

### `python-ai-service/app/reframing/vertical_reframer.py`
- **Purpose**: Reframing pipeline router
- **Function**: reframe_to_vertical(input, output, target_w, target_h, layout_mode)
- **Modes**: auto (decision engine selects), blur_background, smart_crop, split_screen

### `python-ai-service/app/reframing/decision_engine.py`
- **Purpose**: OpenCV-based video analysis for reframing mode selection
- **Functions**: detect_faces(video_path, sample_duration=5) → (count, coords), analyze_video_layout → mode selection
- **Logic**: 0 faces → blur_background, 1 face → smart_crop, 2+ faces → split_screen

### `python-ai-service/app/reframing/face_tracker.py`
- **Purpose**: Face detection using MediaPipe (primary) or OpenCV Haar cascades (fallback)
- **Functions**: detect_faces_mediapipe, detect_faces_opencv, get_face_center

### `python-ai-service/app/reframing/motion_tracker.py`
- **Purpose**: Optical flow motion center detection
- **Function**: detect_motion_center(prev_frame, curr_frame) → (x, y) or None
- **Key Detail**: Currently NOT used in the main pipeline — exists for future frame-tracking reframing

### `python-ai-service/app/reframing/renderers/blur_renderer.py`
- **Purpose**: Blur background reframing — fits video in 9:16 with blurred fill
- **Use Case**: Gaming, screen recordings, no faces

### `python-ai-service/app/reframing/renderers/smart_renderer.py`
- **Purpose**: Face-centered smart crop to 9:16
- **Use Case**: Single speaker, talking head videos

### `python-ai-service/app/reframing/renderers/split_renderer.py`
- **Purpose**: Split-screen reframing — left/right halves stacked vertically
- **Use Case**: 2-person podcasts, interviews

### `python-ai-service/app/routes/health.py`
- **Route**: GET /health
- **Returns**: { status, service, ffmpeg_available, groq_configured }

### `python-ai-service/app/routes/transcription.py`
- **Route**: POST /api/transcribe
- **Input**: { video_path: str }
- **Returns**: TranscriptionResult

### `python-ai-service/app/routes/analysis.py`
- **Route**: POST /api/analyze
- **Input**: { transcript: dict, video_id?: str, desired_clip_count?: int }
- **Returns**: { clips: [...], total: int }

### `python-ai-service/app/routes/clips.py`
- **Route**: POST /api/clips/generate
- **Input**: { video_path, clips: [{id, start, end, title, overlay_title, words}], output_dir }
- **Returns**: { clips: [{id, path}], total }
- **Key Detail**: Cuts clips concurrently with ThreadPoolExecutor (max 4 workers)

### `python-ai-service/app/routes/render.py`
- **Route**: POST /api/render
- **Input**: { clip_path, caption_style, aspect_ratio, layout_mode, captions }
- **Returns**: { output_path, thumbnail_path }

### `python-ai-service/app/utils/logger.py`
- **Purpose**: Loguru logger config
- **Exports**: get_logger(name)

### `python-ai-service/app/utils/file_utils.py`
- **Purpose**: File helpers
- **Exports**: ensure_dir, safe_delete, get_file_size_mb

---

## Frontend — React 19 + Vite 6 (Port 5173)

### `frontend/src/main.jsx`
- **Purpose**: React entry — mounts App inside BrowserRouter + StrictMode

### `frontend/src/App.jsx`
- **Purpose**: Route definitions + Toaster config
- **Routes**: /, /upload, /clips, /clips/:id, /analytics, /settings, *
- **Layout**: All routes wrapped in MainLayout

### `frontend/src/index.css`
- **Purpose**: Complete design system — 350+ lines of CSS variables, component styles, animations
- **Tokens**: --bg-*, --text-*, --accent, --border, --radius, --shadow-*
- **Components**: .btn-*, .glass-panel-*, .sidebar-nav-item, .input, toggle switch, range slider, skeleton
- **Animations**: fade-in, slide-up, shimmer, spin

### `frontend/vite.config.js`
- **Purpose**: Vite config — React plugin, Tailwind CSS v4, @ alias, proxy /api → :3001

### `frontend/src/services/api.js`
- **Purpose**: Axios instance — base URL from VITE_API_URL, JWT from localStorage, 30s timeout

### `frontend/src/services/videoService.js`
- **Purpose**: Video API client
- **Functions**: upload (with progress), uploadLocal, list, getById, delete, getProcessingStatus, retryProcessing, deleteAll

### `frontend/src/services/clipService.js`
- **Purpose**: Clip API client
- **Functions**: listByVideo, listRecent, getById, update, delete, render, export, download, updateCaptions, updateThumbnail
- **Known Issues**: download(), updateCaptions(), updateThumbnail() call endpoints that DON'T EXIST on backend

### `frontend/src/services/settings.service.js`
- **Purpose**: Settings API client
- **Functions**: getSettings, updateSettings

### `frontend/src/store/videoSlice.js`
- **Purpose**: Zustand store for videos
- **State**: videos, currentVideo, uploadProgress, isUploading, isLoading, processingStatuses
- **Actions**: fetchVideos, fetchVideo, uploadVideo, uploadLocalVideo, pollStatus, retryVideo, deleteVideo, deleteAllVideos, clearCurrentVideo

### `frontend/src/store/clipSlice.js`
- **Purpose**: Zustand store for clips
- **State**: clips, activeClip, isLoading, isRendering
- **Actions**: fetchClips, setActiveClip, updateClip, renderClip, exportClip, deleteClip

### `frontend/src/store/uiSlice.js`
- **Purpose**: Zustand store for UI state
- **State**: sidebarCollapsed (persisted in localStorage), commandPaletteOpen, mobileMenuOpen
- **Actions**: toggleSidebar, setSidebarCollapsed, openCommandPalette, closeCommandPalette, toggleCommandPalette, openMobileMenu, closeMobileMenu

### `frontend/src/hooks/useUpload.js`
- **Purpose**: Upload hook with file validation
- **Validates**: File type (from SUPPORTED_VIDEO_FORMATS), size (max 2GB)
- **Returns**: upload, uploadLocalPath, isUploading, uploadProgress, validationError, desiredClipCount, setDesiredClipCount

### `frontend/src/hooks/useClips.js`
- **Purpose**: Clips fetcher hook — calls fetchClips(videoId) on mount

### `frontend/src/lib/utils.js`
- **Purpose**: Utility functions
- **Exports**: cn (tailwind merge), formatDuration, formatFileSize, getScoreColor (≥80 green, ≥60 amber, ≥40 blue, red), truncate

### `frontend/src/constants/platforms.js`
- **Purpose**: Platform export configs (TikTok, Reels, Shorts, Facebook Reels) + validation constants
- **Exports**: PLATFORMS, SUPPORTED_VIDEO_FORMATS, MAX_UPLOAD_SIZE_BYTES (2GB)

### Components — UI (`frontend/src/components/ui/`)
- **Button.jsx**: 5 variants (primary/secondary/ghost/accent/danger), 3 sizes (sm/md/lg), loading state, icon support
- **Card.jsx**: Glass panel card with CardHeader, CardContent, CardFooter sub-components
- **Toggle.jsx**: Accessible switch with label+description, role="switch", aria-checked
- **Badge.jsx**: Status badge (4 variants) + ScoreBadge (color-coded score display)
- **Skeleton.jsx**: Loading placeholder with shimmer — text, card, clip variants
- **EmptyState.jsx**: Illustrated empty state with icon, title, description, action button
- **KPICard.jsx**: Dashboard metric card with icon, label, value, trend indicator

### Components — Clips (`frontend/src/components/clips/`)
- **ClipCard.jsx**: Clip preview card — hover-to-play video, score badge, duration, title. Uses formatDuration, getScoreColor
- **ClipGrid.jsx**: Sortable grid of ClipCards — sort by score/duration/date, uses responsive grid
- **ExportPanel.jsx**: Multi-platform export — TikTok, Reels, Shorts, Facebook. Uses PLATFORMS constant, clipService.export
- **ScoreBreakdown.jsx**: Horizontal bar chart of 6 score categories with gradient fills

### Components — Upload (`frontend/src/components/upload/`)
- **DropzoneUploader.jsx**: Drag-and-drop upload with react-dropzone, local path input, clip count selector, processing status polling, pipeline progress UI

### Components — Layout (`frontend/src/components/layout/`)
- **MainLayout.jsx**: App shell — sidebar (desktop), mobile drawer, TopNav, keyboard shortcuts ([, Ctrl+K), Outlet for page content
- **Sidebar.jsx**: Collapsible sidebar — nav items with icons+labels, processing queue widget, collapse toggle
- **TopNav.jsx**: Contextual top bar — page title, search trigger (Ctrl+K), notifications, profile avatar, mobile menu button
- **CommandPalette.jsx**: Raycast-style command palette — search input, filtered actions, keyboard navigation (arrow keys, Enter, Escape), 8 actions

### Components — Analytics (`frontend/src/components/analytics/`)
- **Empty directory** — analytics components are inline in Analytics.jsx page

### Components — Videos (`frontend/src/components/videos/`)
- **Empty directory** — video components are inline in pages

### Pages (`frontend/src/pages/`)
- **Home.jsx**: Dashboard — 4 KPI cards, processing banner, top clips grid (from clipService.listRecent), activity timeline
- **Upload.jsx**: Upload page — DropzoneUploader component, pipeline progress tracker, video list with status
- **Clips.jsx**: Clip gallery — sortable ClipGrid, fetches from clipService.listRecent
- **ClipDetail.jsx**: Clip detail — video player, metadata, hook display, ScoreBreakdown, ExportPanel. Uses useParams for clip ID
- **Analytics.jsx**: Analytics dashboard — KPI cards, score distribution (computed), top performers table, summary stats
- **Settings.jsx**: 7-tab settings panel — Video, Subtitles, Titles, Grading, AI, Export, Storage. Uses Toggle, Button components
- **NotFound.jsx**: Animated 404 page with gradient background

---

## Storage

### `storage/db.json`
- **Purpose**: JSON file database (~7MB)
- **Collections**: users, videos, clips, transcripts, processingJobs
- **Contains**: 1 demo user, processed videos/clips data

### `storage/settings.json`
- **Purpose**: Application settings (shared between backend and Python service)
- **Categories**: video, subtitles, titles, grading, ai, export, storage

### `storage/7_Days_Stranded_in_The_Arctic_-_MrBeast__1080p__h2_e38f1354/`
- **Purpose**: Processed video folder — contains original/, clips/, temp/ subdirectories

---

# PROJECT HISTORY

## Architectural Decisions
1. **JSON file DB over PostgreSQL**: Simplified dev setup, no external deps. Entire DB loaded into memory, synchronous writes.
2. **Local processing queue over BullMQ**: Redis dependency removed for simplicity. In-memory Set tracks active jobs.
3. **Auth bypass**: Auth middleware grabs first user instead of verifying JWT. Speeds up development.
4. **Single-pass FFmpeg**: `cut_and_reframe()` replaces the two-step cut→reframe pipeline for 2x speed.
5. **Groq Whisper over local**: Cloud transcription is 50-100x faster than CPU Faster-Whisper.
6. **AI subtitle styling**: Groq LLM generates punchy captions with animations, not raw transcription.

## 2026-06-23 Redesign
- Transformed from 2-page prototype into 7-page SaaS app
- Created Stitch MCP design system (ID: 10242216008867644482)
- Built 12 reusable components
- Added sidebar navigation + command palette
- Build: 45KB CSS, 565KB JS, 0 errors

---

# ROUTE MAP

## Frontend Routes (React Router v7)

| Path | Page Component | Layout | Purpose |
|------|----------------|--------|---------|
| `/` | Home.jsx | MainLayout | Dashboard — KPIs, processing banner, top clips |
| `/upload` | Upload.jsx | MainLayout | Video upload — drag-drop, local path, pipeline progress |
| `/clips` | Clips.jsx | MainLayout | Clip gallery — sortable grid of all clips |
| `/clips/:id` | ClipDetail.jsx | MainLayout | Single clip — player, scores, export panel |
| `/analytics` | Analytics.jsx | MainLayout | Analytics — KPIs, score distribution, top performers |
| `/settings` | Settings.jsx | MainLayout | Settings — 7-tab configuration panel |
| `*` | NotFound.jsx | MainLayout | 404 page |

## Backend API Routes (Express)

| Prefix | Router File | Auth | Rate Limit |
|--------|-------------|------|------------|
| `/api/auth` | auth.routes.js | Mixed | authLimiter (POST) |
| `/api/videos` | video.routes.js | ✅ All | uploadLimiter (POST) |
| `/api/clips` | clip.routes.js | ✅ All | apiLimiter |
| `/api/analytics` | analytics.routes.js | ✅ All | apiLimiter |
| `/api/settings` | settings.routes.js | ❌ None | apiLimiter |
| `/api/health` | (inline in routes/index.js) | ❌ None | None |

## Python AI Service Routes (FastAPI)

| Path | Method | Router File | Purpose |
|------|--------|-------------|---------|
| `/health` | GET | health.py | Health check |
| `/api/transcribe` | POST | transcription.py | Transcribe video |
| `/api/analyze` | POST | analysis.py | Viral moment analysis |
| `/api/clips/generate` | POST | clips.py | Cut clips with FFmpeg |
| `/api/render` | POST | render.py | Re-render clip |

---

# STATE MANAGEMENT MAP

## Zustand Stores (3 stores, no reducers — direct state mutation)

### videoSlice (useVideoStore)
```
State:
  videos: []              — All user videos (from /api/videos)
  currentVideo: null      — Single video detail (from /api/videos/:id)
  uploadProgress: 0       — Upload % (0-100)
  isUploading: false      — Upload in progress flag
  isLoading: false        — List/detail loading flag
  processingStatuses: {}  — Map of videoId → status object

Actions:
  fetchVideos(page)       — GET /api/videos → updates videos[]
  fetchVideo(videoId)     — GET /api/videos/:id → updates currentVideo
  uploadVideo(file, cnt)  — POST /api/videos/upload → refreshes list
  uploadLocalVideo(path)  — POST /api/videos/upload-local → refreshes list
  pollStatus(videoId)     — GET /api/videos/:id/status → updates processingStatuses
  retryVideo(videoId)     — POST /api/videos/:id/retry → refreshes list
  deleteVideo(videoId)    — DELETE /api/videos/:id → removes from videos[]
  deleteAllVideos()       — DELETE /api/videos → clears all state
  clearCurrentVideo()     — Resets currentVideo to null
```

### clipSlice (useClipStore)
```
State:
  clips: []               — Clips for current context
  activeClip: null         — Selected clip in editor
  isLoading: false
  isRendering: false

Actions:
  fetchClips(videoId)      — GET /api/clips/video/:videoId → updates clips[]
  setActiveClip(clip)      — Sets activeClip
  updateClip(clipId, data) — PUT /api/clips/:id → updates clips[] + activeClip
  renderClip(clipId, opts) — POST /api/clips/:id/render
  exportClip(clipId, plat) — POST /api/clips/:id/export
  deleteClip(clipId)       — DELETE /api/clips/:id → removes from clips[]
```

### uiSlice (useUIStore)
```
State:
  sidebarCollapsed: bool   — Persisted in localStorage("cf_sidebar")
  commandPaletteOpen: bool
  mobileMenuOpen: bool

Actions:
  toggleSidebar()          — Flip + persist
  setSidebarCollapsed(v)   — Set + persist
  openCommandPalette()
  closeCommandPalette()
  toggleCommandPalette()
  openMobileMenu()
  closeMobileMenu()
```

## Data Flow Patterns

```
Page mount → useEffect → store.fetchX() → service.apiCall() → api.get/post() → backend → response → store.set()
                                                                                                         ↓
                                                                                                    Component re-render
```

- **No context providers** — all state accessed via Zustand hooks (`useVideoStore()`, etc.)
- **No derived state** — computed values are inline in components (e.g., score averages in Analytics.jsx)
- **Polling**: DropzoneUploader polls `videoService.getProcessingStatus()` every 3 seconds during processing

---

# DATABASE MAP

## Engine: JSON File Database

- **File**: `storage/db.json`
- **Driver**: `backend/src/config/database.js`
- **Behavior**: Entire file loaded into memory on startup. Every mutation writes entire file synchronously via `fs.writeFileSync`.
- **No migrations, no schema validation, no transactions, no indices.**

## Collections

### users
| Field | Type | Source |
|-------|------|--------|
| id | string (UUID) | auto-generated |
| name | string | registration |
| email | string | registration |
| password | string | bcrypt hash (12 rounds) |
| createdAt | ISO string | auto |
| updatedAt | ISO string | auto |

**Seed**: Demo user auto-created on first load (`name: "Demo User", email: "demo@clipforge.ai", password: bcrypt("password123")`)

### videos
| Field | Type | Source |
|-------|------|--------|
| id | string (UUID) | auto-generated |
| userId | string | from auth middleware |
| filename | string | multer |
| originalName | string | multer |
| filePath | string | multer destination + filename |
| fileSize | number | multer |
| mimeType | string | multer |
| desiredClipCount | number \| null | upload request |
| status | enum string | video.service |
| errorMessage | string \| null | processing pipeline |
| duration | number \| null | transcription result |
| createdAt | ISO string | auto |
| updatedAt | ISO string | auto |

**Status Flow**: `QUEUED → TRANSCRIBING → ANALYZING → CLIPPING → RENDERING → COMPLETED` or `→ FAILED` (at any step)

### clips
| Field | Type | Source |
|-------|------|--------|
| id | string (UUID) | auto-generated |
| videoId | string | foreign key |
| title | string | AI analysis (title_info.best_title) |
| hook | string | AI analysis (generated_hook) |
| startTime | float | AI analysis (clip_start) |
| endTime | float | AI analysis (clip_end) |
| duration | float | computed (end - start) |
| viralScore | int (0-100) | AI analysis |
| scores | object | { hook, emotion, curiosity, shareability, retention } |
| reason | string | AI explanation |
| audience | string | AI target audience |
| platform | string | AI recommended platform |
| thumbnailText | string | AI overlay (2-6 words) |
| hashtags | string[] | AI generated |
| filePath | string \| null | set after FFmpeg generation |
| status | string \| null | COMPLETED \| RENDERING \| FAILED |
| createdAt | ISO string | auto |

### transcripts
| Field | Type | Source |
|-------|------|--------|
| id | string (UUID) | auto-generated |
| videoId | string | foreign key |
| fullText | string | transcription result |
| segments | array | Segment objects with word-level timestamps |
| language | string | detected language code |
| createdAt | ISO string | auto |

### processingJobs
| Field | Type | Source |
|-------|------|--------|
| id | string | `{videoId}-{step}` |
| videoId | string | foreign key |
| step | string | transcription \| analysis \| clipping \| rendering |
| status | string | processing \| completed \| failed |
| error | string \| null | error message |
| metadata | object \| null | { elapsedMs } |
| startedAt | ISO string \| null | when step started |
| completedAt | ISO string \| null | when step finished |

---

# BUSINESS LOGIC MAP

## Video Processing Pipeline (THE core business logic)

```
Upload (controller)
  ├── Multer saves to storage/{name}_{id}/original/{filename}
  ├── DB: videos.insert({ status: "QUEUED" })
  └── addVideoProcessingJob(videoId, filePath)
        └── processVideo(jobData)  [async, non-blocking]
              │
              ├── Pre-flight checks:
              │   ├── fs.existsSync(videoPath) → FAILED if missing
              │   └── processingService.healthCheck() → FAILED if unreachable
              │
              ├── Step 1: TRANSCRIBING
              │   ├── processingService.transcribe(videoPath)
              │   │     └── Python: transcribe_video()
              │   │           ├── Groq Whisper API (default)
              │   │           │   ├── <25MB: send video directly
              │   │           │   └── >25MB: extract audio → chunk → transcribe → merge
              │   │           └── Local Faster-Whisper (fallback)
              │   └── DB: transcripts.insert({ fullText, segments, language })
              │
              ├── Step 2: ANALYZING
              │   ├── processingService.analyzeTranscript(transcript, videoId, count)
              │   │     └── Python: analyze_transcript_for_viral_moments()
              │   │           ├── Groq LLM (llama-3.3-70b-versatile)
              │   │           ├── Prompt: 5-step title pipeline + scoring
              │   │           └── rank_clips() → weighted scoring → top N
              │   └── Returns: { clips: ViralClip[] }
              │
              ├── Step 3: CLIPPING
              │   └── clipService.createMany(videoId, analysis.clips)
              │         └── DB: clips.insertMany() — maps AI fields to clip records
              │
              ├── Step 4: RENDERING
              │   ├── Fetch clips + transcript words
              │   ├── Build clipSpecs with word-level timestamps (relative to clip start)
              │   ├── processingService.generateClips(videoPath, clipSpecs, outputDir)
              │   │     └── Python: cut_and_reframe() for each clip [ThreadPool max 4]
              │   │           ├── FFmpeg: seek + crop + scale + color grade + ASS subtitles
              │   │           └── AI subtitles: words → Groq → punchy phrases → ASS file
              │   └── DB: clips.update({ filePath, status: "COMPLETED" })
              │
              └── DB: videos.updateOne({ status: "COMPLETED" })
```

## Clip Field Mapping (AI → Database)

| AI Analysis Output | Database Clip Field |
|-------------------|---------------------|
| title_info.best_title | title |
| generated_hook | hook |
| clip_start | startTime |
| clip_end | endTime |
| clip_end - clip_start | duration |
| viral_score | viralScore |
| hook_strength | scores.hook |
| emotion_score | scores.emotion |
| curiosity_score | scores.curiosity |
| shareability_score | scores.shareability |
| retention_score | scores.retention |
| reason | reason |
| audience | audience |
| platform | platform |
| thumbnail_text | thumbnailText |
| hashtags | hashtags |

## Settings Architecture

```
Frontend Settings.jsx
  ↓ PUT /api/settings { category: { key: value } }
Backend settings.controller → settings.js
  ↓ Deep merge with defaults → write storage/settings.json
Python config.py
  ↑ get_settings() reads storage/settings.json on every call
  ↑ Maps: ai.groqApiKey → groq_api_key, ai.groqModel → groq_model, ai.whisperMode → whisper_mode
```

---

# TECHNICAL DEBT & KNOWN ISSUES

## 🔴 Critical

1. **JSON File Database** — No concurrency safety. `fs.writeFileSync` on every mutation. Entire DB loaded in memory. Will not scale past ~1000 records without sluggishness. Migration to PostgreSQL + Prisma is planned but not started.

2. **Auth Bypass** — `auth.middleware.js` grabs first DB user instead of validating JWT. Any request appears authenticated. MUST be fixed before any production deployment.

3. **db.json as single point of failure** — No backups, no WAL, no recovery. File corruption = total data loss.

## 🟠 High Priority

4. **Placeholder Endpoints** — `renderClip()` and `exportClip()` in clip.controller.js return success but don't trigger actual processing. Frontend ExportPanel shows "exported" toast but nothing happens.

5. **Missing Backend Routes** — Frontend calls 3 endpoints that don't exist:
   - `GET /clips/:id/download`
   - `PUT /clips/:id/captions`
   - `PUT /clips/:id/thumbnail`

6. **Settings Route Has No Auth** — Anyone can read/write `storage/settings.json` including the Groq API key.

7. **Synchronous DB Writes** — `fs.writeFileSync` blocks the event loop on every database mutation. With large db.json, this creates noticeable latency.

## 🟡 Medium Priority

8. **Redis Unused** — `ioredis` is imported and connected but BullMQ is never used. Local in-memory processing queue instead. Redis connection errors are silently logged.

9. **No WebSocket Implementation** — `.env.example` defines `VITE_WS_URL` but there's no WebSocket server. Processing status uses HTTP polling (3s interval).

10. **README Inaccuracy** — States PostgreSQL + Prisma ORM, but actual implementation is JSON file. States BullMQ + Redis, but actual is local queue.

11. **No Input Sanitization on Settings** — Settings endpoint accepts any JSON and deep-merges. Could lead to unexpected config state.

12. **Transcript Truncation** — Viral analysis truncates transcript to 12,000 chars. Long videos (>30min) lose context in the latter half.

## 🟢 Low Priority

13. **Empty Component Directories** — `components/analytics/` and `components/videos/` are empty. Components are inline in page files instead of extracted.

14. **motion_tracker.py Unused** — Optical flow motion tracking is implemented but never called in any pipeline.

15. **Duplicate Face Detection** — Both `face_tracker.py` (MediaPipe) and `decision_engine.py` (OpenCV) have independent face detection. Could be unified.

16. **No Error Boundaries** — No React error boundaries. A component crash takes down the entire app.

17. **No Loading States on Some Pages** — Analytics.jsx computes stats client-side from `clipService.listRecent()` — if the API fails, no error handling.
