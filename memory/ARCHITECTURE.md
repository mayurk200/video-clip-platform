# ClipForge AI — Architecture

> Last Updated: 2026-06-23

## System Architecture

```
User → Frontend (React/Vite :5173) → Backend API (Express :3001) → Python AI Service (FastAPI :8000)
                                          ↓                              ↓
                                    JSON DB (db.json)            FFmpeg/OpenCV/Whisper/Groq
                                          ↓                              ↓
                                    Local Storage               Processed Clips + Thumbnails
```

## Frontend Architecture

```
frontend/src/
├── App.jsx              # Root component with React Router
├── main.jsx             # Entry point
├── index.css            # Global styles (Tailwind v4)
├── components/
│   ├── analytics/       # Dashboard analytics components
│   ├── clips/           # Clip viewer/editor components
│   ├── layout/          # Header, sidebar, layout wrappers
│   ├── upload/          # Video upload dropzone components
│   └── videos/          # Video list/detail components
├── pages/
│   ├── Home.jsx         # Main dashboard page (~13KB)
│   └── Settings.jsx     # User settings page (~28KB)
├── hooks/               # Custom React hooks
├── services/            # API client functions (axios-based)
├── store/               # Zustand state management
│   ├── videoSlice.js    # Video state
│   └── clipSlice.js     # Clip state
├── constants/           # Caption styles, platform configs
└── lib/                 # Utilities (cn, formatters)
```

### Key Libraries
- React 19, React Router 7, Zustand 5
- Framer Motion (animations)
- Lucide React (icons)
- React Dropzone (file upload)
- React Hot Toast (notifications)
- Tailwind CSS v4 + tailwind-merge + clsx

## Backend Architecture

```
backend/src/
├── index.js             # Server entry + startup
├── app.js               # Express app configuration
├── api/                 # Route definitions
├── controllers/
│   ├── auth.controller.js
│   ├── video.controller.js
│   ├── clip.controller.js
│   ├── analytics.controller.js
│   └── settings.controller.js
├── services/
│   ├── auth.service.js
│   ├── video.service.js     # Largest service (~5.5KB)
│   ├── clip.service.js
│   └── processing.service.js
├── queues/              # BullMQ queue definitions
├── middleware/          # Auth, upload, rate-limiter, validation, error
├── config/              # App config, database, redis, storage
└── utils/               # Logger, response helpers, file utils
```

### Key Libraries
- Express 4, Helmet, CORS, Morgan
- JWT (jsonwebtoken + bcryptjs)
- Multer (file uploads)
- IORedis (Redis client)
- Winston (logging)
- UUID

## Python AI Service Architecture

```
python-ai-service/app/
├── main.py              # FastAPI app entry
├── config.py            # Configuration (~2KB)
├── routes/              # API endpoints
├── transcription/       # Faster-Whisper word-level transcription
├── scoring/             # Viral scorer (Groq) + weighted clip ranker
├── groq/                # Groq client + prompt templates
├── ffmpeg/              # Clip cutting, audio normalization, extraction
├── reframing/           # Face tracker, motion tracker, vertical reframer
└── utils/               # Logger, file utils
```

### Key Libraries
- FastAPI, Uvicorn, Pydantic v2
- Faster-Whisper (speech-to-text)
- Groq SDK (LLM analysis)
- MediaPipe + OpenCV (face/motion tracking)
- HTTPX, aiofiles

## Data Flow — AI Processing Pipeline

```
1. Upload → Video stored in storage/uploads/
2. Extract audio → WAV for transcription
3. Transcribe → Faster-Whisper with word-level timestamps
4. Analyze → Groq scores emotion, curiosity, hook, engagement, storytelling, controversy
5. Rank → Weighted formula selects top clips
6. Cut → FFmpeg cuts clips with normalized audio
7. Reframe → Face-tracked crop 16:9 → 9:16
8. Captions → Word-by-word animated captions (4 styles)
9. Hooks → AI rewrites openings into 5 hook types
10. Thumbnails → Best frames extracted by visual scoring
```

## Storage Structure

```
storage/
├── uploads/           # Raw uploaded videos
├── processed/         # Intermediate processing artifacts
├── clips/             # Final cut clips
├── thumbnails/        # Extracted thumbnail frames
├── db.json            # Main database (~7MB JSON)
└── settings.json      # App settings
```

## API Surface

### Backend REST API (`:3001/api`)
- Auth: register, login, me
- Videos: upload, list, get, status
- Clips: list by video, update, render, export
- Analytics: dashboard stats
- Settings: get/update

### AI Service API (`:8000`)
- Health check
- Transcribe video
- Analyze transcript
- Generate clips
- Render with reframing
- Generate viral hooks
