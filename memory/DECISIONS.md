# ClipForge AI — Decision Log

> Last Updated: 2026-06-23

## Architectural Decisions

### Decision: Complete UI/UX Redesign with Multi-Page Architecture
- **Date:** 2026-06-23
- **Reason:** Original app had only 2 pages (Home+Settings) with all features crammed into Home. Needed proper SaaS-grade navigation, dedicated pages for each feature, and a reusable component library.
- **Alternatives:** Incremental improvements to existing 2-page layout
- **Consequences:** 7 routes now exist. Users get sidebar navigation, command palette, and dedicated views for upload, clips, analytics. Breaking change: upload is now at /upload instead of /.

### Decision: Geist + Inter Font Pairing
- **Date:** 2026-06-23
- **Reason:** Geist (headlines) gives Vercel/Linear premium feel; Inter (body) provides excellent readability. Both are free Google Fonts.
- **Alternatives:** Single font (Inter only), Outfit, Plus Jakarta Sans
- **Consequences:** Two font downloads (~50KB). Geist used for h1-h6, Inter for body text.

### Decision: Stitch MCP for Design System Foundation
- **Date:** 2026-06-23
- **Reason:** Used Stitch MCP to create "ClipForge Dark Premium" design system (TONAL_SPOT, dark mode, Geist+Inter). Design system tokens guided the CSS implementation.
- **Alternatives:** Manual design system creation only
- **Consequences:** Design system asset stored in Stitch (ID: 10242216008867644482). Can be reused for future screen generation.

### Decision: JSON File Database Instead of PostgreSQL
- **Date:** Pre-2026-06-23 (initial build)
- **Reason:** Simplified development setup — no need for PostgreSQL installation. db.json in storage/ handles persistence.
- **Alternatives:** PostgreSQL + Prisma ORM (as documented in README but not implemented)
- **Consequences:** Limited scalability, no relational integrity, entire DB loaded into memory. Suitable for development/demo only.

### Decision: Three-Service Architecture
- **Date:** Pre-2026-06-23 (initial build)
- **Reason:** Separation of concerns — Node.js for API/auth/routing, Python for AI/ML workloads, React for UI
- **Alternatives:** Monolithic Node.js app, or full Python backend
- **Consequences:** Requires running 3 services for development. Clear service boundaries. Python service can scale independently.

### Decision: Tailwind CSS v4 for Frontend Styling
- **Date:** Pre-2026-06-23 (initial build)
- **Reason:** Modern utility-first CSS with v4's new architecture
- **Alternatives:** Vanilla CSS, styled-components, CSS modules
- **Consequences:** Fast development, consistent styling, but requires Tailwind knowledge. Using @tailwindcss/vite plugin.

### Decision: Zustand for State Management
- **Date:** Pre-2026-06-23 (initial build)
- **Reason:** Lightweight, minimal boilerplate, React 19 compatible
- **Alternatives:** Redux Toolkit, Jotai, React Context
- **Consequences:** Simple store pattern with slices (videoSlice, clipSlice, uiSlice). No devtools overhead.

### Decision: Groq API for LLM Analysis
- **Date:** Pre-2026-06-23 (initial build)
- **Reason:** Fast inference speeds, cost-effective, llama-3.3-70b-versatile model
- **Alternatives:** OpenAI GPT-4, Anthropic Claude, local LLMs
- **Consequences:** Dependent on Groq API availability. Model: llama-3.3-70b-versatile.

### Decision: Faster-Whisper for Transcription
- **Date:** Pre-2026-06-23 (initial build)
- **Reason:** Fast, accurate word-level timestamps, runs locally on CPU
- **Alternatives:** OpenAI Whisper API, AssemblyAI, Deepgram
- **Consequences:** Local processing — no API costs but requires compute. Configurable model size (default: base).
