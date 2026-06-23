# ClipForge AI — Features

> Last Updated: 2026-06-23

## Core Features

### Video Upload
- **Description:** Upload long-form videos via drag-and-drop interface
- **Dependencies:** React Dropzone, Multer, local storage
- **Status:** ✅ Implemented
- **Page:** `/upload`

### AI Transcription
- **Description:** Word-level transcription using Faster-Whisper
- **Dependencies:** faster-whisper, Python AI service
- **Status:** ✅ Implemented

### Viral Scoring
- **Description:** AI-powered scoring based on emotion, curiosity, hook quality, engagement, storytelling, controversy
- **Dependencies:** Groq API, llama-3.3-70b-versatile
- **Status:** ✅ Implemented
- **Formula:** `viral_score = emotion × 0.25 + curiosity × 0.20 + hook × 0.20 + engagement × 0.15 + storytelling × 0.10 + controversy × 0.10`

### Clip Generation
- **Description:** Auto-cut top-scoring segments into short-form clips
- **Dependencies:** FFmpeg, scoring module
- **Status:** ✅ Implemented

### Vertical Reframing
- **Description:** Face-tracked crop from 16:9 → 9:16 for mobile platforms
- **Dependencies:** MediaPipe, OpenCV, FFmpeg
- **Status:** ✅ Implemented

### Caption Generation
- **Description:** Word-by-word animated captions with 4 style presets
- **Dependencies:** Transcription timestamps, FFmpeg
- **Status:** ✅ Implemented

### AI Hook Generator
- **Description:** AI rewrites clip openings into 5 viral hook types
- **Dependencies:** Groq API
- **Status:** ✅ Implemented

### Thumbnail Extraction
- **Description:** Best frames extracted via visual scoring
- **Dependencies:** OpenCV, FFmpeg
- **Status:** ✅ Implemented

### Multi-Platform Export
- **Description:** Export clips optimized for TikTok, Instagram Reels, YouTube Shorts, Facebook Reels
- **Dependencies:** FFmpeg, platform-specific configs
- **Status:** ✅ Implemented
- **Page:** `/clips/:id` (ExportPanel component)

### User Authentication
- **Description:** Register/login with JWT-based auth
- **Dependencies:** bcryptjs, jsonwebtoken
- **Status:** ✅ Implemented (backend only, no frontend auth pages)

## UI/UX Features (NEW — 2026-06-23 Redesign)

### Dashboard
- **Description:** KPI cards, processing banner, top clips grid, activity timeline
- **Page:** `/`
- **Status:** ✅ Implemented

### Sidebar Navigation
- **Description:** Collapsible sidebar with nav items, processing widget, keyboard shortcut `[`
- **Component:** Sidebar.jsx
- **Status:** ✅ Implemented

### Command Palette
- **Description:** Raycast-style Ctrl+K search with keyboard navigation
- **Component:** CommandPalette.jsx
- **Status:** ✅ Implemented

### Clip Gallery
- **Description:** Sortable grid of all clips with hover-to-play cards
- **Page:** `/clips`
- **Status:** ✅ Implemented

### Clip Detail Page
- **Description:** Video player, metadata, hook display, score breakdown, export panel
- **Page:** `/clips/:id`
- **Status:** ✅ Implemented

### Analytics Dashboard
- **Description:** Score distribution, top performers, KPI cards, summary stats
- **Page:** `/analytics`
- **Status:** ✅ Implemented

### Settings Page
- **Description:** 7-tab configuration panel with Toggle components
- **Page:** `/settings`
- **Status:** ✅ Redesigned

### Processing Pipeline
- **Description:** Visual stage-by-stage progress tracker
- **Page:** `/upload`
- **Status:** ✅ Implemented

### UI Component Library
- **Description:** Button, Card, Toggle, Badge, Skeleton, EmptyState, KPICard, ClipCard, ClipGrid, ExportPanel, ScoreBreakdown
- **Status:** ✅ 11 components implemented

### 404 Page
- **Description:** Custom animated 404 with navigation options
- **Page:** `*`
- **Status:** ✅ Implemented

## Planned Features

### Authentication Pages
- **Description:** Login/register UI for the existing JWT backend
- **Status:** 📋 Planned

### Light Mode
- **Description:** Toggle between dark/light themes
- **Status:** 📋 Planned (design system supports it)

### Prisma + PostgreSQL Database
- **Description:** Migrate from JSON file DB to proper relational database
- **Status:** 📋 Planned
