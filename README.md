# 🎬 ClipForge AI — Viral Short-Video Clipping Platform

> AI-powered platform that transforms long-form videos into viral short-form clips optimized for TikTok, Instagram Reels, YouTube Shorts, and Facebook Reels.

## Architecture

```
Frontend (React/Vite) → Node.js API Gateway → Python AI Worker → FFmpeg/OpenCV/Whisper → Groq Analysis → Final Clips
```

## Tech Stack

| Layer              | Technology                                        |
| ------------------ | ------------------------------------------------- |
| Frontend           | React 19, Vite 6, Tailwind CSS v4, Framer Motion  |
| Backend            | Node.js, Express, Prisma ORM                      |
| AI Service         | Python FastAPI, Faster-Whisper, Groq API           |
| Video Processing   | FFmpeg, OpenCV, MediaPipe                          |
| Queue              | BullMQ + Redis                                    |
| Database           | PostgreSQL                                        |
| Storage            | Local filesystem (S3-ready)                       |

## Project Structure

```
video_clip/
├── frontend/              # React + Vite + Tailwind frontend
│   └── src/
│       ├── components/    # UI components (auth, upload, clips, editor, analytics, layout)
│       ├── pages/         # Route pages (Landing, Dashboard, Upload, ClipEditor, Analytics, Settings)
│       ├── hooks/         # Custom hooks (useAuth, useUpload, useClips, useVideoPlayer, useProcessingStatus)
│       ├── services/      # API clients (auth, video, clip, analytics)
│       ├── store/         # Zustand stores (auth, video, clip, UI)
│       ├── layouts/       # Auth + Dashboard layouts
│       ├── constants/     # Caption styles, platform configs
│       └── lib/           # Utilities (cn, formatters)
│
├── backend/               # Node.js Express API
│   └── src/
│       ├── api/routes/    # REST routes (auth, video, clip, analytics)
│       ├── controllers/   # Request handlers
│       ├── services/      # Business logic (auth, video, clip, processing)
│       ├── queues/        # BullMQ queues + workers
│       ├── middleware/    # Auth, upload, rate-limiter, validation, error handler
│       ├── config/        # App config, database, redis, storage
│       ├── utils/         # Logger, response helpers, file utils, validators
│       └── prisma/        # Schema + seed
│
├── python-ai-service/     # FastAPI AI microservice
│   └── app/
│       ├── transcription/ # Faster-Whisper word-level transcription
│       ├── scoring/       # Viral scorer (Groq) + weighted clip ranker
│       ├── hooks/         # AI hook generator (5 types)
│       ├── captions/      # Word-by-word caption generator + style presets
│       ├── ffmpeg/        # Clip cutting, audio normalization, extraction
│       ├── reframing/     # Face tracker, motion tracker, vertical reframer
│       ├── thumbnails/    # Frame scoring + thumbnail extraction
│       ├── scenes/        # Scene change detection
│       ├── groq/          # Groq client + prompt templates
│       ├── pipelines/     # Master orchestrator (8-step pipeline)
│       ├── routes/        # API endpoints
│       └── utils/         # Logger, file utils
│
└── storage/               # Local file storage
    ├── uploads/
    ├── processed/
    ├── clips/
    └── thumbnails/
```

## Setup (Local Development)

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 16+
- Redis 7+
- FFmpeg (in PATH)

### 1. Environment Variables

```bash
cp .env.example .env
# Edit .env with your Groq API key and database credentials
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma db push --schema=src/prisma/schema.prisma
npx prisma generate --schema=src/prisma/schema.prisma
npm run db:seed       # Create demo user
npm run dev           # Starts on :3001
```

### 3. Python AI Service

```bash
cd python-ai-service
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev           # Starts on :5173
```

### 5. Open

Navigate to `http://localhost:5173`

Demo credentials: `demo@clipforge.ai` / `demo1234`

## AI Processing Pipeline

1. **Upload** → Video stored + queued
2. **Extract audio** → WAV for transcription
3. **Transcribe** → Faster-Whisper with word-level timestamps
4. **Analyze** → Groq scores emotion, curiosity, hook, engagement, storytelling, controversy
5. **Rank** → Weighted formula selects top clips
6. **Cut** → FFmpeg cuts clips with normalized audio
7. **Reframe** → Face-tracked crop from 16:9 → 9:16
8. **Captions** → Word-by-word animated captions (4 styles)
9. **Hooks** → AI rewrites openings into 5 hook types
10. **Thumbnails** → Best frames extracted by visual scoring

## Viral Scoring Formula

```
viral_score = emotion × 0.25 + curiosity × 0.20 + hook × 0.20
            + engagement × 0.15 + storytelling × 0.10 + controversy × 0.10
```

## API Endpoints

### Backend (Node.js) — `http://localhost:3001/api`

| Method | Route                    | Description           |
| ------ | ------------------------ | --------------------- |
| POST   | `/auth/register`         | Register user         |
| POST   | `/auth/login`            | Login                 |
| GET    | `/auth/me`               | Get profile           |
| POST   | `/videos/upload`         | Upload video          |
| GET    | `/videos`                | List videos           |
| GET    | `/videos/:id`            | Get video details     |
| GET    | `/videos/:id/status`     | Processing status     |
| GET    | `/clips/video/:videoId`  | List clips for video  |
| PUT    | `/clips/:id`             | Update clip           |
| POST   | `/clips/:id/render`      | Render clip           |
| POST   | `/clips/:id/export`      | Export for platform   |
| GET    | `/analytics/dashboard`   | Dashboard stats       |

### AI Service (Python) — `http://localhost:8000`

| Method | Route                | Description                  |
| ------ | -------------------- | ---------------------------- |
| GET    | `/health`            | Health check                 |
| POST   | `/api/transcribe`    | Transcribe video             |
| POST   | `/api/analyze`       | Analyze transcript for viral |
| POST   | `/api/clips/generate`| Cut clips from video         |
| POST   | `/api/render`        | Render with reframing        |
| POST   | `/api/hooks/generate`| Generate viral hooks         |

## License

MIT
