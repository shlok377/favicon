# 03: Horizontal Banner, Auto-Fallback & Social / Tile Generation

**What to build:** An upload zone for Horizontal / Social banners (~1.91:1 / 1200x630) with automatic smart fallback (centering the square icon on a 1200x630 padded canvas if no horizontal image is provided), generating social media preview images (`og-image.png`, `twitter-image.png`), Windows Microsoft tiles (`mstile-150x150.png`, `mstile-310x150.png`, `mstile-70x70.png`, `mstile-310x310.png`, `browserconfig.xml`), and an auto-generated monochrome silhouette vector (`safari-pinned-tab.svg`).

**Blocked by:** 02: Core Asset Generation Engine & Basic Download Tracer Slice

**Status:** completed

- [x] Horizontal image upload box in the frontend with image format validation and preview.
- [x] Backend smart auto-fallback that generates a clean 1200x630 social card from the square image when the horizontal image is missing.
- [x] Generation of OpenGraph (`og-image.png`) and Twitter Card (`twitter-image.png`) assets.
- [x] Windows tile generation and `browserconfig.xml` manifest creation.
- [x] Auto-monochrome conversion logic extracting an alpha-mask vector/SVG (`safari-pinned-tab.svg`).
- [x] Integration of all social and Windows tile assets into the exported ZIP archive.
