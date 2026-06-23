# ClipForge AI — Knowledge Graph

> Last Updated: 2026-06-23

## Component Relationships

```
ClipForge AI Platform
├── Frontend (React 19 + Vite 6) [:5173]
│   ├── Pages
│   │   ├── Home.jsx (Dashboard)
│   │   └── Settings.jsx
│   ├── Components
│   │   ├── analytics/ → Analytics Service
│   │   ├── clips/ → Clip Service
│   │   ├── layout/ → App Shell
│   │   ├── upload/ → Video Service
│   │   └── videos/ → Video Service
│   ├── Store (Zustand 5)
│   │   ├── videoSlice.js → Video API
│   │   └── clipSlice.js → Clip API
│   ├── Services (Axios)
│   │   └── → Backend API (:3001)
│   └── Hooks
│       └── Custom React hooks
│
├── Backend (Node.js Express) [:3001]
│   ├── Controllers
│   │   ├── auth.controller → Auth Service
│   │   ├── video.controller → Video Service
│   │   ├── clip.controller → Clip Service
│   │   ├── analytics.controller → DB
│   │   └── settings.controller → Settings
│   ├── Services
│   │   ├── auth.service → JWT + bcrypt
│   │   ├── video.service → Storage + AI Service
│   │   ├── clip.service → Storage + DB
│   │   └── processing.service → AI Service (:8000)
│   ├── Middleware
│   │   ├── Auth (JWT verification)
│   │   ├── Upload (Multer)
│   │   ├── Rate Limiter
│   │   └── Error Handler
│   ├── Queues (BullMQ)
│   │   └── → Redis
│   └── Config
│       ├── Database → storage/db.json
│       ├── Redis → localhost:6379
│       └── Storage → ./storage/
│
├── Python AI Service (FastAPI) [:8000]
│   ├── Routes → API Endpoints
│   ├── Transcription → Faster-Whisper
│   ├── Scoring → Groq API (llama-3.3-70b)
│   ├── FFmpeg → Clip Cutting + Audio
│   ├── Reframing → MediaPipe + OpenCV
│   ├── Groq Client → groq SDK
│   └── Utils → Logging (loguru)
│
└── Storage (Local Filesystem)
    ├── uploads/ ← Raw videos
    ├── processed/ ← Intermediate files
    ├── clips/ ← Final clips
    ├── thumbnails/ ← Extracted frames
    ├── db.json ← JSON database
    └── settings.json ← App settings
```

## External Dependencies

```
External Services
├── Groq API (LLM inference)
│   └── Model: llama-3.3-70b-versatile
├── Redis (Queue backend)
│   └── localhost:6379
└── FFmpeg (Video processing)
    └── System PATH
```

## Data Flow

```
User Upload → Multer → storage/uploads/
     ↓
Backend Queue → Processing Service → Python AI Service
     ↓                                       ↓
     ↓                              Faster-Whisper (transcribe)
     ↓                                       ↓
     ↓                              Groq API (score & analyze)
     ↓                                       ↓
     ↓                              FFmpeg (cut & reframe)
     ↓                                       ↓
storage/clips/ ← Final Clips ← AI Service Response
storage/thumbnails/ ← Thumbnails
     ↓
Frontend Dashboard ← Backend API ← db.json
```
