# ClipForge AI — DEPENDENCY GRAPH

> Generated: 2026-06-23

---

## Frontend Dependencies (package.json)

| Library | Version | Purpose | Files Using It |
|---------|---------|---------|----------------|
| react | ^19.0.0 | UI framework | Every .jsx file |
| react-dom | ^19.0.0 | DOM rendering | main.jsx |
| react-router-dom | ^7.1.0 | Routing & navigation | App.jsx, MainLayout, Sidebar, TopNav, CommandPalette, ClipDetail, NotFound |
| zustand | ^5.0.0 | State management | videoSlice, clipSlice, uiSlice |
| axios | ^1.7.9 | HTTP client | api.js, videoService, clipService, settings.service |
| framer-motion | ^11.15.0 | Animations | KPICard, ClipCard, Home, Upload, Settings, Analytics, CommandPalette |
| lucide-react | ^0.469.0 | Icons | Every component and page |
| react-dropzone | ^14.3.5 | File drag-and-drop | DropzoneUploader |
| react-hot-toast | ^2.4.1 | Toast notifications | App.jsx, useUpload, Upload |
| clsx | ^2.1.1 | Conditional classes | lib/utils.js |
| tailwind-merge | ^2.6.0 | Tailwind class merging | lib/utils.js |

### Dev Dependencies
| Library | Version | Purpose |
|---------|---------|---------|
| vite | ^6.0.0 | Build tool |
| @vitejs/plugin-react | ^4.3.4 | React JSX support |
| tailwindcss | ^4.3.1 | CSS framework |
| @tailwindcss/vite | ^4.3.1 | Tailwind Vite plugin |
| @types/node | ^22.10.0 | Node type definitions |
| eslint | ^9.16.0 | Linting |

---

## Backend Dependencies (package.json)

| Library | Version | Purpose | Files Using It |
|---------|---------|---------|----------------|
| express | ^4.21.0 | HTTP framework | app.js, all routes |
| cors | ^2.8.5 | Cross-origin | app.js |
| helmet | ^8.0.0 | Security headers | app.js |
| morgan | ^1.10.0 | HTTP logging | app.js |
| axios | ^1.7.9 | HTTP client (→ Python) | processing.service.js |
| bcryptjs | ^2.4.3 | Password hashing | auth.service.js |
| jsonwebtoken | ^9.0.2 | JWT auth | auth.service.js, auth.middleware.js |
| express-rate-limit | ^7.4.0 | Rate limiting | rateLimiter.middleware.js |
| express-validator | ^7.2.0 | Input validation | auth.routes.js, validation.middleware.js |
| multer | ^1.4.5-lts.1 | File upload | upload.middleware.js |
| uuid | ^11.0.0 | UUID generation | upload.middleware.js |
| winston | ^3.17.0 | Logging | utils/logger.js |
| ioredis | ^5.4.2 | Redis client | config/redis.js |
| dotenv | ^17.4.2 | Env vars (dev) | config/index.js |

---

## Python Dependencies (requirements.txt)

| Library | Version | Purpose | Files Using It |
|---------|---------|---------|----------------|
| fastapi | 0.115.6 | HTTP framework | main.py, all routes |
| uvicorn[standard] | 0.34.0 | ASGI server | CLI startup |
| pydantic | 2.10.4 | Data models | All models.py, routes |
| pydantic-settings | 2.7.1 | Settings management | config.py |
| python-dotenv | 1.0.1 | Env vars | config.py |
| python-multipart | 0.0.20 | Multipart support | — |
| faster-whisper | 1.1.0 | Local transcription | transcription/service.py |
| groq | 0.15.0 | Groq API client | groq/client.py, transcription/service.py |
| mediapipe | 0.10.35 | Face detection | reframing/face_tracker.py |
| opencv-python-headless | 4.10.0.84 | Computer vision | face_tracker, motion_tracker, decision_engine |
| numpy | (latest) | Array operations | motion_tracker, face_tracker |
| httpx | 0.28.1 | Async HTTP | — |
| aiofiles | 24.1.0 | Async file I/O | — |
| loguru | 0.7.3 | Logging | utils/logger.py |

### External System Dependencies
| Dependency | Purpose | Required By |
|------------|---------|-------------|
| FFmpeg | Video processing | clipper.py, ass_generator.py, all renderers, transcription |
| FFprobe | Video metadata | clipper.py, smart_renderer.py |
| Redis | BullMQ (unused) | config/redis.js (imported but not critical) |
