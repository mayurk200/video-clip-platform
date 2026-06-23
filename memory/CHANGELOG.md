# ClipForge AI — Changelog

> Last Updated: 2026-06-23

## 2026-06-23 — Complete UI/UX Redesign

### Added

- **Stitch MCP Design System**: Created "ClipForge Dark Premium" design system (asset ID: `10242216008867644482`) with Geist+Inter fonts, TONAL_SPOT dark mode, blue/purple/pink accents
- **Sidebar Navigation**: Collapsible sidebar with Dashboard, Upload, My Clips, Analytics, Settings links, processing queue widget, and collapse toggle (keyboard shortcut: `[`)
- **Command Palette**: Raycast-style `Ctrl+K` / `⌘K` command palette with search, keyboard navigation, and quick actions
- **Dashboard Page** (`/`): KPI cards (Videos, Clips, Avg Score, Queue), processing banner, top clips grid, activity timeline
- **Upload Page** (`/upload`): Dedicated upload experience with dropzone and pipeline progress tracker
- **Clips Page** (`/clips`): Gallery with sort controls (score, duration, date), responsive grid, empty state
- **Clip Detail Page** (`/clips/:id`): Video player, metadata, hook display, score breakdown bars, platform export panel
- **Analytics Page** (`/analytics`): KPI cards, score distribution chart, top performers leaderboard, summary statistics
- **404 Page**: Custom gradient 404 with back navigation
- **UI Component Library**: Button, Card, Toggle, Badge/ScoreBadge, Skeleton, EmptyState, KPICard (7 components)
- **Clip Components**: ClipCard (hover-to-play), ClipGrid (sortable), ExportPanel (4 platforms), ScoreBreakdown (6 categories)
- **UI State Store** (`uiSlice.js`): Sidebar state, command palette state, mobile menu state
- **Geist Font**: Added alongside Inter for headline/display typography
- **Open Graph meta tags** and theme-color for SEO

### Updated

- **index.css**: Complete overhaul — 350+ lines of design tokens, button variants (primary/secondary/ghost/accent/danger), form elements, toggle switch, range slider, animations, sidebar styles, skeleton loading
- **MainLayout.jsx**: Redesigned with persistent desktop sidebar, animated mobile drawer, keyboard shortcut integration
- **TopNav.jsx**: Slim contextual top bar with page title, search trigger, notifications, profile
- **Settings.jsx**: Polished with Toggle components, consistent input styling, Button component usage
- **App.jsx**: 7 routes (/, /upload, /clips, /clips/:id, /analytics, /settings, \*)

### Removed

- Inline HTML checkbox toggles (replaced by Toggle component)
- Monolithic Home.jsx (split into Dashboard + Upload)
- Catch-all redirect to `/` (replaced by proper 404 page)

### Reason

Transform from basic 2-page prototype into production-grade SaaS application with proper navigation, component library, and multi-page architecture.

### Impact

- Navigation: Users now have sidebar + command palette + 7 distinct pages
- Components: 11 new reusable components reduce code duplication
- Accessibility: Focus rings, role="switch", aria-labels, keyboard shortcuts
- Performance: Build outputs at 45KB CSS (8.9KB gzip) + 565KB JS (177KB gzip)
- Design: Consistent dark mode with Geist/Inter, 8px grid, layered shadows

---

## 2026-06-23 — Memory System Initialization

### Added

- Memory system: Created all 9 memory files for persistent project knowledge

### Reason

Establishing memory-first workflow for persistent project knowledge across sessions
