# 🎨 Favi — Favicon & Social Asset Generator

> A developer-first, one-click generator for multi-resolution favicons, Apple touch icons, PWA manifests, Windows tiles, and WhatsApp / OpenGraph social preview cards.

Inspired by [Favicomatic](https://favicomatic.com/) — designed with a minimal Material UI aesthetic, zero-friction setup, and ready-to-copy framework embed snippets (HTML, Next.js, Vite/Astro).

---

## ⚡ Quick Start (One-Click Launch)

Clone or download the repo and double-click the startup script for your operating system:

### 🪟 Windows
Double click `start.bat` or run:
```cmd
start.bat
```

### 🍎 macOS & 🐧 Linux
Run:
```bash
./start.sh
```

The script will automatically:
1. Verify Python 3 & Node.js
2. Create a local `.venv` and install backend dependencies
3. Install frontend npm packages
4. Launch the FastAPI backend on port `1947` and the Vite React frontend on port `3737`
5. Open `http://localhost:3737` in your default browser!

---

## 🌟 Key Features

- **Master Square Upload (1:1)**: Drop a square image to generate multi-resolution `.ico`, 16/32/48/96 PNGs, Apple Touch Icon (180x180), and Android Chrome icons (192x192, 512x512).
- **Horizontal / Social Banner (~1.91:1)**: Upload a wide banner for WhatsApp and social previews.
- **Smart Auto-Fallback**: If you don't have a wide banner, the generator automatically creates a clean 1200x630 social card by centering your square icon with brand padding.
- **Auto-Monochrome SVG**: Automatically converts your logo to a vector silhouette mask (`safari-pinned-tab.svg`).
- **Live Interactive Previews**:
  - 🌐 **Browser Tab Preview**: Real-time favicon + title in a simulated browser tab.
  - 📱 **iOS Home Screen Preview**: Curved squircle icon mockup on mobile background.
  - 💬 **WhatsApp / Social Share Preview**: Card banner, title, description, and domain inside a simulated chat message bubble.
  - 🪟 **Windows Start Tile Preview**: Square and wide live tiles.
- **Metadata Customization**: Live editing of App Name, Short Name, Theme Color (with hex & color picker), Background Color, Site URL, and Description.
- **Presets & Custom Selection**:
  - **Standard**: Complete modern suite (all 16+ assets).
  - **Minimal Essentials Only**: Core `.ico`, `apple-touch-icon.png`, 16/32 PNGs, and basic `<link>` tags.
  - **Select Manually**: Fine-grained category checklist (Favicons, Apple iOS, Android/PWA, Windows, Social Cards).
- **Ready-to-Copy Embed Snippets**:
  - Standard HTML `<head>` tags
  - Next.js (App Router `app/layout.tsx` metadata configuration)
  - Vite / Astro `<head>` tags
- **Flat ZIP Archive**: Everything extracts cleanly into your project's `public/` or `static/` directory with zero file rearrangement needed.

---

## 📦 Output Assets

```
favicons.zip/
├── favicon.ico                   # Multi-resolution: 16x16, 32x32, 48x48
├── favicon-16x16.png             # Standard resolution tab icon
├── favicon-32x32.png             # Retina/HiDPI tab icon
├── favicon-48x48.png             # Shortcut icon
├── favicon-96x96.png             # Google TV / Desktop icon
├── apple-touch-icon.png          # iOS home screen bookmark (180x180)
├── apple-touch-icon-precomposed.png
├── safari-pinned-tab.svg         # Monochrome vector silhouette mask
├── android-chrome-192x192.png    # Android launcher icon
├── android-chrome-512x512.png    # PWA splash icon
├── site.webmanifest              # Web App Manifest JSON
├── mstile-70x70.png              # Small Windows tile
├── mstile-150x150.png            # Medium Windows tile
├── mstile-310x150.png            # Wide Windows banner tile
├── mstile-310x310.png            # Large Windows tile
├── browserconfig.xml             # Windows tile manifest XML
├── og-image.png                  # 1200x630 OpenGraph / WhatsApp share card
├── twitter-image.png             # 1200x630 Twitter large card
├── head-tags.html                # Copy-ready HTML embed code
└── README.md                     # Asset placement instructions
```

---

## 🛠️ Tech Stack & Architecture

- **Backend (Port 1947)**: Python FastAPI + Uvicorn + Pillow (PIL)
- **Frontend (Port 3737)**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **Proxy**: Vite proxies `/api/*` directly to `http://localhost:1947`

---

## 🧪 Testing

Run backend tests:
```bash
cd backend
.venv/bin/pytest
```

Run frontend build check:
```bash
cd frontend
npm run build
```

---

## 📄 License

MIT © [shlok377](https://github.com/shlok377)
