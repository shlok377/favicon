# 04: Metadata Customization & Multi-Framework Embed Code Generator

**What to build:** An interactive configuration panel in the web UI allowing users to input their App Name, Short Name, Theme Color (with hex code input and color picker), Site URL, and Description. These values dynamically populate the generated `site.webmanifest`, `browserconfig.xml`, and an in-app interactive tabbed code snippet viewer with one-click copy buttons for standard HTML `<head>` tags, Next.js App Router metadata, and Vite/Astro/React headers.

**Blocked by:** 03: Horizontal Banner, Auto-Fallback & Social / Tile Generation

**Status:** completed

- [x] Frontend metadata configuration panel with inputs for App Name, Short Name, Theme Color, Site URL, and Description.
- [x] Backend generation of customized `site.webmanifest` and `browserconfig.xml` files reflecting the user's custom metadata.
- [x] Inclusion of `head-tags.html` snippet file and a `README.md` guide inside the root of the exported ZIP.
- [x] In-app tabbed code previewer with copy-to-clipboard buttons supporting:
  - Standard HTML `<head>` tags (Favicons, Apple Touch, PWA Manifest, OpenGraph/WhatsApp, Twitter Card)
  - Next.js App Router metadata configuration and file placement guide
  - Vite / Astro / React HTML embed snippet
