# ClipForge AI — MCP Registry

> Last Updated: 2026-06-23

## Available MCP Servers

### Stitch (Design/UI)

**Purpose:** UI screen generation, design system management, project management

**Capabilities:**
- `create_project` — Create a new Stitch project
- `get_project` / `list_projects` — Retrieve project info
- `list_screens` / `get_screen` — View design screens
- `generate_screen_from_text` — Generate UI screens from text descriptions
- `edit_screens` — Edit existing screens
- `generate_variants` — Generate design variants
- `upload_design_md` — Upload design markdown
- `create_design_system` — Create a design system
- `create_design_system_from_design_md` — Create design system from markdown
- `update_design_system` — Update existing design system
- `list_design_systems` — List all design systems
- `apply_design_system` — Apply a design system to screens

**Priority:** HIGH — Used for design system creation in redesign

**Status:** Available (lazy-loaded)

**Last Used:** 2026-06-23

**Project Data:**
- Project ID: `14885074678680094802` ("ClipForge AI Redesign")
- Design System Asset: `10242216008867644482` ("ClipForge Dark Premium")
  - Dark mode, TONAL_SPOT color variant
  - Geist + Inter fonts
  - Blue/Purple/Pink accent palette
  - ROUND_EIGHT border radius

**Usage Notes:**
- `generate_screen_from_text` may timeout (~4min) — use `get_screen` to poll
- Use `GEMINI_3_1_PRO` model for best quality
- All tools are lazy-loaded — read schema files before first use
- Schema files: `C:\Users\Mayur\.gemini\antigravity-ide\mcp\stitch\`
