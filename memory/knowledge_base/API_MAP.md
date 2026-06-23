# ClipForge AI — API MAP

> Generated: 2026-06-23

---

## Backend REST API — `http://localhost:3001/api`

### Auth

| Method | Route | Auth | Controller | Request Body | Response | Used By (Frontend) |
|--------|-------|------|------------|-------------|----------|---------------------|
| POST | `/auth/register` | ❌ | auth.register | `{ name, email, password }` | `{ user, token }` | None (no frontend auth pages) |
| POST | `/auth/login` | ❌ | auth.login | `{ email, password }` | `{ user, token }` | None |
| GET | `/auth/me` | ✅ | auth.getProfile | — | `{ user }` | None |
| PUT | `/auth/me` | ✅ | auth.updateProfile | `{ name?, email? }` | `{ user }` | None |

### Videos

| Method | Route | Auth | Controller | Request Body | Response | Used By (Frontend) |
|--------|-------|------|------------|-------------|----------|---------------------|
| POST | `/videos/upload` | ✅ | video.upload | multipart/form-data `{ video, desiredClipCount? }` | `{ video }` | videoService.upload → useUpload |
| POST | `/videos/upload-local` | ✅ | video.uploadLocal | `{ localPath, desiredClipCount? }` | `{ video }` | videoService.uploadLocal → DropzoneUploader |
| GET | `/videos` | ✅ | video.list | query: `page, limit` | `{ videos[], total }` | videoService.list → videoSlice.fetchVideos |
| GET | `/videos/:id` | ✅ | video.getById | — | `{ video }` | videoService.getById → videoSlice.fetchVideo |
| GET | `/videos/:id/status` | ✅ | video.getStatus | — | `{ status, errorMessage, canRetry, videoInfo, steps }` | videoService.getProcessingStatus → DropzoneUploader |
| POST | `/videos/:id/retry` | ✅ | video.retryVideo | — | `{ video }` | videoService.retryProcessing → DropzoneUploader |
| DELETE | `/videos/:id` | ✅ | video.deleteVideo | — | `{}` | videoService.delete → videoSlice.deleteVideo |
| DELETE | `/videos` | ✅ | video.deleteAll | — | `{}` | videoService.deleteAll → videoSlice.deleteAllVideos |

### Clips

| Method | Route | Auth | Controller | Request Body | Response | Used By (Frontend) |
|--------|-------|------|------------|-------------|----------|---------------------|
| GET | `/clips/recent?limit=N` | ✅ | clip.listRecent | query: `limit` | `{ clips[] }` | clipService.listRecent → Home, Clips, Analytics |
| GET | `/clips/video/:videoId` | ✅ | clip.listByVideo | — | `{ clips[] }` | clipService.listByVideo → clipSlice.fetchClips |
| GET | `/clips/:id` | ✅ | clip.getById | — | `{ clip }` | clipService.getById → ClipDetail |
| PUT | `/clips/:id` | ✅ | clip.update | `{ title?, hook?, ... }` | `{ clip }` | clipService.update → clipSlice.updateClip |
| DELETE | `/clips/:id` | ✅ | clip.deleteClip | — | `{}` | clipService.delete → clipSlice.deleteClip |
| POST | `/clips/:id/render` | ✅ | clip.renderClip | `{ captionStyle?, aspectRatio? }` | `{ message }` | clipService.render → clipSlice.renderClip |
| POST | `/clips/:id/export` | ✅ | clip.exportClip | `{ platform }` | `{ message }` | clipService.export → ExportPanel |

> ⚠️ **Note**: `render` and `export` are **placeholders** — they return success messages but don't trigger actual processing.

### Analytics

| Method | Route | Auth | Controller | Response | Used By |
|--------|-------|------|------------|----------|---------|
| GET | `/analytics/dashboard` | ✅ | analytics.getDashboardStats | `{ stats: { totalVideos, totalClips, avgViralScore, avgProcessingTime } }` | Home (KPI cards) |

### Settings

| Method | Route | Auth | Controller | Response | Used By |
|--------|-------|------|------------|----------|---------|
| GET | `/settings` | ❌ | settings.getSettingsController | Settings JSON (7 categories) | Settings page |
| PUT | `/settings` | ❌ | settings.updateSettingsController | Updated settings JSON | Settings page |

> ⚠️ **Note**: Settings routes have **no auth middleware** — publicly accessible.

### Health

| Method | Route | Auth | Response |
|--------|-------|------|----------|
| GET | `/api/health` | ❌ | `{ status: "ok", timestamp }` |

---

## Python AI Service — `http://localhost:8000`

| Method | Route | Request Body | Response | Called By |
|--------|-------|-------------|----------|-----------|
| GET | `/health` | — | `{ status, service, ffmpeg_available, groq_configured }` | processingService.healthCheck → videoProcessor pre-flight |
| POST | `/api/transcribe` | `{ video_path }` | TranscriptionResult (full_text, segments, language, duration) | processingService.transcribe → videoProcessor step 1 |
| POST | `/api/analyze` | `{ transcript, video_id?, desired_clip_count? }` | `{ clips[], total }` | processingService.analyzeTranscript → videoProcessor step 2 |
| POST | `/api/clips/generate` | `{ video_path, clips[], output_dir }` | `{ clips: [{id, path}], total }` | processingService.generateClips → videoProcessor step 4 |
| POST | `/api/render` | `{ clip_path, caption_style?, aspect_ratio?, layout_mode?, captions? }` | `{ output_path, thumbnail_path }` | processingService.renderClip → clipGenerator worker |

---

## Frontend API Calls Without Backend Endpoints

| Frontend Function | Endpoint Called | Status |
|-------------------|----------------|--------|
| clipService.download(clipId) | GET `/clips/:id/download` | ❌ No backend route |
| clipService.updateCaptions(clipId, captions) | PUT `/clips/:id/captions` | ❌ No backend route |
| clipService.updateThumbnail(clipId, data) | PUT `/clips/:id/thumbnail` | ❌ No backend route |
