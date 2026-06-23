# ClipForge AI — COMPONENT MAP

> Generated: 2026-06-23 | Total Components: 16

---

## UI Components (`frontend/src/components/ui/`)

### Button
- **Path**: [Button.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/ui/Button.jsx)
- **Purpose**: Universal button with 5 variants, 3 sizes, loading/disabled/icon states
- **Props**: variant (primary|secondary|ghost|accent|danger), size (sm|md|lg), loading, disabled, icon, className, children, ...rest
- **Dependencies**: lucide-react (Loader2)
- **Used By**: Settings, Upload, ClipDetail, EmptyState, NotFound, ExportPanel

### Card
- **Path**: [Card.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/ui/Card.jsx)
- **Purpose**: Glass panel card container with sub-components
- **Props**: className, children
- **Sub-components**: CardHeader, CardContent, CardFooter
- **Dependencies**: None
- **Used By**: Analytics, ClipDetail, Home

### Toggle
- **Path**: [Toggle.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/ui/Toggle.jsx)
- **Purpose**: Accessible toggle switch with label and description
- **Props**: checked, onChange, label, description, disabled
- **Accessibility**: role="switch", aria-checked, focus-visible ring
- **Dependencies**: None
- **Used By**: Settings (all tabs)

### Badge
- **Path**: [Badge.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/ui/Badge.jsx)
- **Purpose**: Status badges + viral score badge
- **Exports**: Badge (variant: default|success|warning|danger), ScoreBadge (score, size)
- **Dependencies**: lib/utils.js (getScoreColor)
- **Used By**: ClipCard, ClipDetail, Analytics, Home

### Skeleton
- **Path**: [Skeleton.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/ui/Skeleton.jsx)
- **Purpose**: Loading placeholder with shimmer animation
- **Variants**: text (lines), card, clip (grid)
- **Props**: variant, lines, count, className
- **Dependencies**: None
- **Used By**: Home, Clips, Analytics (loading states)

### EmptyState
- **Path**: [EmptyState.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/ui/EmptyState.jsx)
- **Purpose**: Empty state with icon, text, and action
- **Props**: icon (Lucide component), title, description, actionLabel, onAction
- **Dependencies**: Button
- **Used By**: Clips, Home, Analytics

### KPICard
- **Path**: [KPICard.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/ui/KPICard.jsx)
- **Purpose**: Dashboard metric card with trend indicator
- **Props**: icon (Lucide), label, value, trend (string like "+12%"), trendUp (bool), accent (bool)
- **Dependencies**: framer-motion
- **Used By**: Home, Analytics

---

## Clip Components (`frontend/src/components/clips/`)

### ClipCard
- **Path**: [ClipCard.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/clips/ClipCard.jsx)
- **Purpose**: Clip preview card with hover-to-play, score badge, metadata
- **Props**: clip (object), onClick
- **Dependencies**: ScoreBadge, framer-motion, lib/utils (formatDuration, getScoreColor)
- **Used By**: ClipGrid, Home

### ClipGrid
- **Path**: [ClipGrid.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/clips/ClipGrid.jsx)
- **Purpose**: Sortable grid of ClipCards with sort controls
- **Props**: clips (array), onClipClick, loading
- **Sort Options**: score (desc), duration (desc), date (desc)
- **Dependencies**: ClipCard, Skeleton
- **Used By**: Clips, Home

### ExportPanel
- **Path**: [ExportPanel.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/clips/ExportPanel.jsx)
- **Purpose**: Multi-platform export buttons
- **Props**: clipId
- **Platforms**: TikTok, Instagram Reels, YouTube Shorts, Facebook Reels
- **Dependencies**: PLATFORMS constant, clipService
- **Used By**: ClipDetail

### ScoreBreakdown
- **Path**: [ScoreBreakdown.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/clips/ScoreBreakdown.jsx)
- **Purpose**: Horizontal bar visualization of 6 score categories
- **Props**: scores (object with hook, emotion, curiosity, shareability, retention)
- **Categories**: Hook, Emotion, Curiosity, Shareability, Retention
- **Dependencies**: None
- **Used By**: ClipDetail

---

## Upload Components (`frontend/src/components/upload/`)

### DropzoneUploader
- **Path**: [DropzoneUploader.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/upload/DropzoneUploader.jsx)
- **Purpose**: Full upload experience — drag-drop, local path input, clip count, processing status
- **Props**: None (uses hooks internally)
- **Dependencies**: react-dropzone, useUpload hook, useVideoStore, framer-motion, videoService
- **Used By**: Upload

---

## Layout Components (`frontend/src/components/layout/`)

### MainLayout
- **Path**: [MainLayout.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/layout/MainLayout.jsx)
- **Purpose**: App shell — sidebar + topnav + content + mobile drawer
- **Keyboard Shortcuts**: `[` (toggle sidebar), `Ctrl+K` (command palette)
- **Dependencies**: Sidebar, TopNav, CommandPalette, useUIStore, react-router-dom (Outlet)
- **Used By**: App.jsx (wraps all routes)

### Sidebar
- **Path**: [Sidebar.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/layout/Sidebar.jsx)
- **Purpose**: Collapsible left sidebar — nav items, processing queue widget
- **Props**: collapsed (bool), onToggle
- **Nav Items**: Dashboard (/), Upload (/upload), My Clips (/clips), Analytics (/analytics), Settings (/settings)
- **Dependencies**: lucide-react, react-router-dom (NavLink), useVideoStore
- **Used By**: MainLayout

### TopNav
- **Path**: [TopNav.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/layout/TopNav.jsx)
- **Purpose**: Contextual top bar — page title, search trigger, notifications, profile
- **Dependencies**: lucide-react, useUIStore, react-router-dom (useLocation)
- **Used By**: MainLayout

### CommandPalette
- **Path**: [CommandPalette.jsx](file:///d:/ADCET/projects/main/video_clip/frontend/src/components/layout/CommandPalette.jsx)
- **Purpose**: Raycast-style Ctrl+K command palette
- **Actions**: 8 actions (navigate to pages, upload, search clips, keyboard shortcuts)
- **Keyboard**: ArrowUp/Down (navigate), Enter (select), Escape (close)
- **Dependencies**: lucide-react, framer-motion, useUIStore, react-router-dom (useNavigate)
- **Used By**: MainLayout
