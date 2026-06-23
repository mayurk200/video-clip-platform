# ClipForge AI — Project Memory

> Last Updated: 2026-06-23

## Project Overview

**Name:** ClipForge AI
**Type:** Viral Short-Video Clipping Platform
**Purpose:** AI-powered platform that transforms long-form videos into viral short-form clips optimized for TikTok, Instagram Reels, YouTube Shorts, and Facebook Reels.

## Tech Stack

| Layer            | Technology                                       |
| ---------------- | ------------------------------------------------ |
| Frontend         | React 19, Vite 6, Tailwind CSS v4, Framer Motion |
| Backend          | Node.js, Express, JSON file DB (db.json)         |
| AI Service       | Python FastAPI, Faster-Whisper, Groq API         |
| Video Processing | FFmpeg, OpenCV, MediaPipe                        |
| Queue            | BullMQ + Redis (configured, may not be active)   |
| Database         | JSON file-based (storage/db.json, ~7MB)          |
| Storage          | Local filesystem (S3-ready architecture)         |

## Frontend Architecture (Post-Redesign)

| Area                      | Files                                                                      |
| ------------------------- | -------------------------------------------------------------------------- |
| **Pages (7)**             | Home (Dashboard), Upload, Clips, ClipDetail, Analytics, Settings, NotFound |
| **Layout (4)**            | MainLayout, Sidebar, TopNav, CommandPalette                                |
| **UI Components (7)**     | Button, Card, Toggle, Badge, Skeleton, EmptyState, KPICard                 |
| **Clip Components (4)**   | ClipCard, ClipGrid, ExportPanel, ScoreBreakdown                            |
| **Upload Components (1)** | DropzoneUploader                                                           |
| **Stores (3)**            | videoSlice, clipSlice, uiSlice                                             |
| **Services (4)**          | api, clipService, videoService, settings.service                           |
| **Hooks (2)**             | useUpload, useClips                                                        |

## Routes

| Path         | Page       | Description                              |
| ------------ | ---------- | ---------------------------------------- |
| `/`          | Home       | Dashboard with KPIs, top clips, activity |
| `/upload`    | Upload     | Video upload + processing pipeline       |
| `/clips`     | Clips      | Sortable clip gallery                    |
| `/clips/:id` | ClipDetail | Video player, scores, export             |
| `/analytics` | Analytics  | Score distribution, stats                |
| `/settings`  | Settings   | 7-tab AI pipeline config                 |
| `*`          | NotFound   | Custom 404 page                          |

## Design System

- **Stitch MCP Asset ID:** `10242216008867644482`
- **Stitch Project ID:** `14885074678680094802`
- **Fonts:** Geist (headlines), Inter (body)
- **Color Mode:** Dark (TONAL_SPOT)
- **Primary:** `#3B82F6`, Secondary: `#8B5CF6`, Tertiary: `#EC4899`
- **Roundness:** 8px
- **Surfaces:** #000 → #0A0A0A → #111 → #171717

## Ports

| Service    | Port |
| ---------- | ---- |
| Frontend   | 5173 |
| Backend    | 3001 |
| AI Service | 8000 |

## Credentials

- Demo: `demo@clipforge.ai` / `demo1234`

## Build Output

- CSS: 45.21 KB (8.88 KB gzip)
- JS: 565.37 KB (177.30 KB gzip)
- Build time: ~14s

## Memory Files

| File               | Status     |
| ------------------ | ---------- |
| PROJECT_MEMORY.md  | ✅ Updated |
| ARCHITECTURE.md    | ✅ Updated |
| DECISIONS.md       | ✅ Updated |
| FEATURES.md        | ✅ Updated |
| BUGS.md            | ✅ Created |
| TASKS.md           | ✅ Created |
| MCP_REGISTRY.md    | ✅ Updated |
| CHANGELOG.md       | ✅ Updated |
| KNOWLEDGE_GRAPH.md | ✅ Created |
