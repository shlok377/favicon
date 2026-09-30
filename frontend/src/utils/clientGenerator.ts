import JSZip from 'jszip';
import type { MetadataState } from '../components/MetadataPanel';
import type { PresetType, CustomCategoriesState } from '../components/PresetSelector';

export interface GenerateClientOptions {
  squareFile: File | Blob;
  horizontalFile?: File | Blob | null;
  metadata: MetadataState;
  preset: PresetType;
  customCategories?: CustomCategoriesState;
}

// -------------------------------------------------------------
// Color & Image Loading Helpers
// -------------------------------------------------------------

function hexToRgb(hexColor: string, defaultRgb: [number, number, number] = [255, 255, 255]): [number, number, number] {
  if (!hexColor) return defaultRgb;
  let clean = hexColor.trim().replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return defaultRgb;
  const num = parseInt(clean, 16);
  if (isNaN(num)) return defaultRgb;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function loadImage(fileOrBlob: Blob | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fileOrBlob);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image: ' + err));
    };
    img.src = url;
  });
}

// -------------------------------------------------------------
// High-Fidelity Canvas Image Processing (Autotrim, Progressive Downscale, Sharpening)
// -------------------------------------------------------------

function trimTransparentBorders(
  sourceCanvas: HTMLCanvasElement,
  paddingPct: number = 0.04
): HTMLCanvasElement {
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  let minX = w, minY = h, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const alpha = data[(y * w + x) * 4 + 3];
      if (alpha > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) return sourceCanvas;

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const maxDim = Math.max(cropW, cropH);
  const pad = Math.floor(maxDim * paddingPct);
  const canvasSize = maxDim + pad * 2;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = canvasSize;
  outCanvas.height = canvasSize;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return sourceCanvas;

  const pasteX = Math.floor((canvasSize - cropW) / 2);
  const pasteY = Math.floor((canvasSize - cropH) / 2);

  outCtx.drawImage(sourceCanvas, minX, minY, cropW, cropH, pasteX, pasteY, cropW, cropH);
  return outCanvas;
}

function applyUnsharpMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const copy = new Uint8ClampedArray(data);

  // 3x3 unsharp convolution kernel
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const alpha = copy[idx + 3];
      if (alpha < 10) continue;

      for (let c = 0; c < 3; c++) {
        const center = copy[idx + c];
        const up = copy[((y - 1) * width + x) * 4 + c];
        const down = copy[((y + 1) * width + x) * 4 + c];
        const left = copy[(y * width + (x - 1)) * 4 + c];
        const right = copy[(y * width + (x + 1)) * 4 + c];

        const laplacian = 4 * center - (up + down + left + right);
        const val = center + strength * laplacian;
        data[idx + c] = Math.min(255, Math.max(0, val));
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

function renderResizedCanvas(
  source: HTMLCanvasElement | HTMLImageElement,
  targetW: number,
  targetH: number,
  options: {
    bgColor?: string;
    autotrim?: boolean;
    sharpen?: boolean;
    fit?: boolean;
  } = {}
): HTMLCanvasElement {
  const { bgColor, autotrim = true, sharpen = true, fit = true } = options;

  let workSource: HTMLCanvasElement | HTMLImageElement = source;

  // Render to initial canvas if autotrimming is applicable
  if (autotrim && targetW <= 180 && source.width === source.height) {
    const initCanvas = document.createElement('canvas');
    initCanvas.width = source.width;
    initCanvas.height = source.height;
    const initCtx = initCanvas.getContext('2d');
    if (initCtx) {
      initCtx.drawImage(source, 0, 0);
      workSource = trimTransparentBorders(initCanvas, 0.04);
    }
  }

  let finalW = targetW;
  let finalH = targetH;
  let pasteX = 0;
  let pasteY = 0;

  if (fit) {
    const ratio = Math.min(targetW / workSource.width, targetH / workSource.height);
    finalW = Math.max(1, Math.round(workSource.width * ratio));
    finalH = Math.max(1, Math.round(workSource.height * ratio));
    pasteX = Math.floor((targetW - finalW) / 2);
    pasteY = Math.floor((targetH - finalH) / 2);
  }

  // Progressive step-down downsampling for high fidelity
  let curCanvas = document.createElement('canvas');
  curCanvas.width = workSource.width;
  curCanvas.height = workSource.height;
  let curCtx = curCanvas.getContext('2d')!;
  curCtx.imageSmoothingEnabled = true;
  curCtx.imageSmoothingQuality = 'high';
  curCtx.drawImage(workSource, 0, 0);

  let curW = workSource.width;
  let curH = workSource.height;

  while (curW > finalW * 2 && curH > finalH * 2) {
    const nextW = Math.max(finalW, Math.floor(curW / 2));
    const nextH = Math.max(finalH, Math.floor(curH / 2));
    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = nextW;
    nextCanvas.height = nextH;
    const nextCtx = nextCanvas.getContext('2d')!;
    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = 'high';
    nextCtx.drawImage(curCanvas, 0, 0, curW, curH, 0, 0, nextW, nextH);

    curCanvas = nextCanvas;
    curCtx = nextCtx;
    curW = nextW;
    curH = nextH;
  }

  // Final Output Canvas
  const outCanvas = document.createElement('canvas');
  outCanvas.width = targetW;
  outCanvas.height = targetH;
  const outCtx = outCanvas.getContext('2d')!;
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';

  // Fill Background Color if provided and not transparent
  if (bgColor && bgColor.toLowerCase() !== 'transparent') {
    const rgb = hexToRgb(bgColor);
    outCtx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    outCtx.fillRect(0, 0, targetW, targetH);
  }

  outCtx.drawImage(curCanvas, 0, 0, curW, curH, pasteX, pasteY, finalW, finalH);

  // Apply Adaptive Unsharp Mask for small icon resolutions
  if (sharpen && Math.max(finalW, finalH) <= 96) {
    const strength =
      Math.max(finalW, finalH) <= 16
        ? 0.35
        : Math.max(finalW, finalH) <= 32
        ? 0.25
        : Math.max(finalW, finalH) <= 48
        ? 0.18
        : 0.10;
    applyUnsharpMask(outCtx, targetW, targetH, strength);
  }

  return outCanvas;
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      resolve(bytes);
    } catch {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to export canvas to PNG blob'));
          return;
        }
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf))).catch(reject);
      }, 'image/png');
    }
  });
}

// -------------------------------------------------------------
// Multi-Resolution .ico Generator (16x16, 32x32, 48x48)
// -------------------------------------------------------------

function buildIcoFile(frames: { width: number; height: number; pngBytes: Uint8Array }[]): Uint8Array {
  const count = frames.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalDirSize = headerSize + count * dirEntrySize;

  let totalSize = totalDirSize;
  for (const f of frames) {
    totalSize += f.pngBytes.length;
  }

  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer);

  // ICONDIR Header
  view.setUint16(0, 0, true);       // Reserved (0)
  view.setUint16(2, 1, true);       // Type (1 = ICO)
  view.setUint16(4, count, true);   // Number of images

  let currentOffset = totalDirSize;

  for (let i = 0; i < count; i++) {
    const f = frames[i];
    const entryOffset = headerSize + i * dirEntrySize;

    view.setUint8(entryOffset + 0, f.width === 256 ? 0 : f.width);
    view.setUint8(entryOffset + 1, f.height === 256 ? 0 : f.height);
    view.setUint8(entryOffset + 2, 0); // Palette color count
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel
    view.setUint32(entryOffset + 8, f.pngBytes.length, true); // Size of image data
    view.setUint32(entryOffset + 12, currentOffset, true); // Offset of image data

    buffer.set(f.pngBytes, currentOffset);
    currentOffset += f.pngBytes.length;
  }

  return buffer;
}

// -------------------------------------------------------------
// Safari Pinned Tab Monochrome SVG Vector Mask Generator
// -------------------------------------------------------------

function generateMonochromeSvg(source: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0, 64, 64);

  const imgData = ctx.getImageData(0, 0, 64, 64);
  const data = imgData.data;

  // Determine if image is opaque
  let minAlpha = 255;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < minAlpha) minAlpha = data[i];
  }
  const isOpaque = minAlpha >= 240;

  let isForeground: (x: number, y: number) => boolean;

  if (isOpaque) {
    // Average corner brightness
    const corners = [
      (data[0] + data[1] + data[2]) / 3,
      (data[(63) * 4] + data[(63) * 4 + 1] + data[(63) * 4 + 2]) / 3,
      (data[(63 * 64) * 4] + data[(63 * 64) * 4 + 1] + data[(63 * 64) * 4 + 2]) / 3,
      (data[(63 * 64 + 63) * 4] + data[(63 * 64 + 63) * 4 + 1] + data[(63 * 64 + 63) * 4 + 2]) / 3,
    ];
    const cornerAvg = corners.reduce((a, b) => a + b, 0) / 4;

    isForeground = (x, y) => {
      const idx = (y * 64 + x) * 4;
      const lum = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
      return cornerAvg >= 128 ? lum < 128 : lum >= 128;
    };
  } else {
    isForeground = (x, y) => {
      const idx = (y * 64 + x) * 4;
      return data[idx + 3] > 128;
    };
  }

  const svgLines = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
  ];

  for (let y = 0; y < 64; y++) {
    let runStart: number | null = null;
    for (let x = 0; x < 64; x++) {
      const active = isForeground(x, y);
      if (active && runStart === null) {
        runStart = x;
      } else if (!active && runStart !== null) {
        const width = x - runStart;
        svgLines.push(`  <rect x="${runStart}" y="${y}" width="${width}" height="1" fill="#000000" />`);
        runStart = null;
      }
    }
    if (runStart !== null) {
      const width = 64 - runStart;
      svgLines.push(`  <rect x="${runStart}" y="${y}" width="${width}" height="1" fill="#000000" />`);
    }
  }

  svgLines.push('</svg>');
  return svgLines.join('\n');
}

// -------------------------------------------------------------
// Category Resolution & Snippet Generators (HTML, Next.js, Vite, Manifests, README)
// -------------------------------------------------------------

function resolveCategories(
  preset: PresetType,
  custom?: CustomCategoriesState
): [boolean, boolean, boolean, boolean, boolean] {
  let standard = true;
  let apple = true;
  let android = true;
  let windows = true;
  let social = true;

  if (preset === 'minimal') {
    android = false;
    windows = false;
    social = false;
  } else if (preset === 'custom' && custom) {
    standard = custom.standard_favicons;
    apple = custom.apple_ios;
    android = custom.android_pwa;
    windows = custom.windows_tiles;
    social = custom.social_cards;
  }

  return [standard, apple, android, windows, social];
}

function generateWebmanifest(metadata: MetadataState): string {
  const manifest = {
    name: metadata.appName || 'My Web App',
    short_name: metadata.shortName || 'App',
    icons: [
      {
        src: '/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/favicon-196x196.png',
        sizes: '196x196',
        type: 'image/png',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color: metadata.themeColor || '#004643',
    background_color: metadata.backgroundColor || '#ffffff',
    display: 'standalone',
    start_url: '/',
  };
  return JSON.stringify(manifest, null, 2);
}

function generateBrowserconfig(metadata: MetadataState): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="/mstile-70x70.png"/>
      <square150x150logo src="/mstile-150x150.png"/>
      <wide310x150logo src="/mstile-310x150.png"/>
      <square310x310logo src="/mstile-310x310.png"/>
      <TileColor>${metadata.themeColor || '#004643'}</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
}

function generateHtmlSnippet(
  metadata: MetadataState,
  preset: PresetType,
  custom?: CustomCategoriesState
): string {
  const [includeStandard, includeApple, includeAndroid, includeWindows, includeSocial] = resolveCategories(preset, custom);
  const lines: string[] = [];

  if (includeStandard) {
    lines.push(
      '<!-- Favicon & Browser Icons -->',
      '<link rel="icon" type="image/x-icon" href="/favicon.ico">',
      '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
      '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
      '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">',
      '<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">',
      '<link rel="icon" type="image/png" sizes="128x128" href="/favicon-128.png">',
      '<link rel="icon" type="image/png" sizes="196x196" href="/favicon-196x196.png">'
    );
  }

  if (includeApple) {
    if (lines.length) lines.push('');
    lines.push(
      '<!-- Apple Touch Icons (iOS) -->',
      '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
      '<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">',
      '<link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">',
      '<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">',
      '<link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">',
      '<link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png">',
      '<link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png">',
      '<link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png">',
      '<link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png">',
      `<link rel="mask-icon" href="/safari-pinned-tab.svg" color="${metadata.themeColor || '#004643'}">`
    );
  }

  if (includeAndroid) {
    if (lines.length) lines.push('');
    lines.push(
      '<!-- Android & PWA Manifest -->',
      '<link rel="manifest" href="/site.webmanifest">',
      `<meta name="theme-color" content="${metadata.themeColor || '#004643'}">`
    );
  }

  if (includeWindows) {
    if (lines.length) lines.push('');
    lines.push(
      '<!-- Windows Microsoft Tiles -->',
      `<meta name="msapplication-TileColor" content="${metadata.themeColor || '#004643'}">`,
      '<meta name="msapplication-TileImage" content="/mstile-144x144.png">',
      '<meta name="msapplication-config" content="/browserconfig.xml">'
    );
  }

  if (includeSocial) {
    if (lines.length) lines.push('');
    const cleanUrl = (metadata.siteUrl || 'https://example.com').replace(/\/$/, '');
    const domain = cleanUrl.replace(/^https?:\/\//, '');
    lines.push(
      '<!-- Open Graph / Facebook / WhatsApp Share Cards -->',
      '<meta property="og:type" content="website">',
      `<meta property="og:url" content="${cleanUrl}">`,
      `<meta property="og:title" content="${metadata.appName || 'My Web App'}">`,
      `<meta property="og:description" content="${metadata.description || ''}">`,
      `<meta property="og:image" content="${cleanUrl}/og-image.png">`,
      '',
      '<!-- Twitter Card -->',
      '<meta name="twitter:card" content="summary_large_image">',
      `<meta property="twitter:domain" content="${domain}">`,
      `<meta property="twitter:url" content="${cleanUrl}">`,
      `<meta name="twitter:title" content="${metadata.appName || 'My Web App'}">`,
      `<meta name="twitter:description" content="${metadata.description || ''}">`,
      `<meta name="twitter:image" content="${cleanUrl}/twitter-image.png">`
    );
  }

  return lines.join('\n');
}

function generateNextJsSnippet(
  metadata: MetadataState,
  preset: PresetType,
  custom?: CustomCategoriesState
): string {
  const [includeStandard, includeApple, includeAndroid, , includeSocial] = resolveCategories(preset, custom);
  const cleanUrl = (metadata.siteUrl || 'https://example.com').replace(/\/$/, '');

  const iconEntries: string[] = [];
  if (includeStandard) {
    iconEntries.push(
      "{ url: '/favicon.ico' }",
      "{ url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }",
      "{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }",
      "{ url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' }",
      "{ url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }",
      "{ url: '/favicon-128.png', sizes: '128x128', type: 'image/png' }",
      "{ url: '/favicon-196x196.png', sizes: '196x196', type: 'image/png' }"
    );
  }

  const appleEntries: string[] = [];
  if (includeApple) {
    appleEntries.push(
      "{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }",
      "{ url: '/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' }",
      "{ url: '/apple-touch-icon-144x144.png', sizes: '144x144', type: 'image/png' }",
      "{ url: '/apple-touch-icon-120x120.png', sizes: '120x120', type: 'image/png' }",
      "{ url: '/apple-touch-icon-114x114.png', sizes: '114x114', type: 'image/png' }",
      "{ url: '/apple-touch-icon-76x76.png', sizes: '76x76', type: 'image/png' }",
      "{ url: '/apple-touch-icon-72x72.png', sizes: '72x72', type: 'image/png' }",
      "{ url: '/apple-touch-icon-60x60.png', sizes: '60x60', type: 'image/png' }",
      "{ url: '/apple-touch-icon-57x57.png', sizes: '57x57', type: 'image/png' }"
    );
  }

  const iconsBody: string[] = [];
  if (iconEntries.length) {
    iconsBody.push('    icon: [\n' + iconEntries.map(e => `      ${e}`).join(',\n') + ',\n    ],');
  }
  if (appleEntries.length) {
    iconsBody.push('    apple: [\n' + appleEntries.map(e => `      ${e}`).join(',\n') + ',\n    ],');
  }
  if (includeApple) {
    iconsBody.push(`    other: [\n      {\n        rel: 'mask-icon',\n        url: '/safari-pinned-tab.svg',\n        color: '${metadata.themeColor || '#004643'}',\n      },\n    ],`);
  }

  const iconsCode = iconsBody.length ? `  icons: {\n${iconsBody.join('\n')}\n  },\n` : '';
  const manifestCode = includeAndroid ? "  manifest: '/site.webmanifest',\n" : '';

  let ogCode = '';
  if (includeSocial) {
    ogCode = `  openGraph: {
    title: '${metadata.appName || 'My Web App'}',
    description: '${metadata.description || ''}',
    url: '${cleanUrl}',
    siteName: '${metadata.appName || 'My Web App'}',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '${metadata.appName || 'My Web App'}',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '${metadata.appName || 'My Web App'}',
    description: '${metadata.description || ''}',
    images: ['/twitter-image.png'],
  },
`;
  }

  return `// app/layout.tsx (Next.js App Router)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${metadata.appName || 'My Web App'}',
  description: '${metadata.description || ''}',
  metadataBase: new URL('${cleanUrl}'),
${iconsCode}${manifestCode}${ogCode}};`;
}

function generateViteSnippet(
  metadata: MetadataState,
  preset: PresetType,
  custom?: CustomCategoriesState
): string {
  const htmlCode = generateHtmlSnippet(metadata, preset, custom);
  return `<!-- Vite / SPA Integration (index.html) -->
<!-- 1. Extract all icons and manifests directly into your Vite project's "public/" directory -->
<!-- 2. Paste the following tags inside the <head> of your index.html: -->

${htmlCode}

<!-- Tip for vite-plugin-pwa (optional in vite.config.ts):
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      manifest: false, // uses the included site.webmanifest from public/
    }),
  ],
});
-->`;
}

function generateReadme(metadata: MetadataState): string {
  return `# ${metadata.appName || 'My Web App'} Favicon & Asset Pack

All files in this zip archive are organized with a flat structure and ready to be placed directly into your web project's \`public/\` (or \`static/\`) directory.

## 📁 Included Assets

1. **Favicons & Browser Icons**:
   - \`favicon.ico\` (Multi-resolution: 16x16, 32x32, 48x48)
   - \`favicon-16x16.png\`, \`favicon-32x32.png\`, \`favicon-48x48.png\`, \`favicon-96x96.png\`
   - \`favicon-128.png\` (Chrome Web Store / legacy desktop)
   - \`favicon-196x196.png\` (Legacy Android home screen)

2. **Apple iOS Touch Icons**:
   - \`apple-touch-icon.png\` (180x180 modern iOS standard)
   - \`apple-touch-icon-precomposed.png\` (180x180)
   - Legacy iOS sizes: \`57x57\`, \`60x60\`, \`72x72\`, \`76x76\`, \`114x114\`, \`120x120\`, \`144x144\`, \`152x152\`
   - \`safari-pinned-tab.svg\` (Monochrome vector mask)

3. **Android & PWA**:
   - \`android-chrome-192x192.png\`, \`android-chrome-512x512.png\`
   - \`site.webmanifest\` (App Name: "${metadata.appName || 'My Web App'}", Theme Color: ${metadata.themeColor || '#004643'})

4. **Windows Tiles & Config**:
   - \`mstile-70x70.png\`, \`mstile-144x144.png\`, \`mstile-150x150.png\`, \`mstile-310x310.png\`
   - \`mstile-310x150.png\`
   - \`browserconfig.xml\`

5. **Social & WhatsApp Sharing Cards**:
   - \`og-image.png\` (1200x630 OpenGraph card)
   - \`twitter-image.png\` (1200x630 Twitter card)

6. **Embed Snippets**:
   - \`snippet-html.txt\` (Standard HTML \`<head>\` tags)
   - \`snippet-nextjs.txt\` (Next.js App Router metadata object)
   - \`snippet-vite.txt\` (Vite index.html tags & PWA guide)
   - \`code.txt\` (Favic-o-matic compatible HTML snippet)
   - \`head-tags.html\` (HTML snippet in HTML format)

## 🚀 How to Use

1. Unzip and copy all files to your project's \`public/\` (or \`static/\`) folder.
2. Choose your preferred snippet file:
   - For HTML/PHP/Static: copy from \`snippet-html.txt\` or \`head-tags.html\`
   - For Next.js: copy \`metadata\` from \`snippet-nextjs.txt\` into \`app/layout.tsx\`
   - For Vite/React/Vue: copy tags from \`snippet-vite.txt\` into \`index.html\`

Generated with Favicon & Social Asset Generator.
`;
}

// -------------------------------------------------------------
// Main Client-Side Favicon Generator Pipeline
// -------------------------------------------------------------

export async function generateFaviconBundleInBrowser(
  options: GenerateClientOptions
): Promise<Blob> {
  const { squareFile, horizontalFile, metadata, preset, customCategories } = options;

  const squareImg = await loadImage(squareFile);
  const horizontalImg = horizontalFile ? await loadImage(horizontalFile) : null;

  const [includeStandard, includeApple, includeAndroid, includeWindows, includeSocial] =
    resolveCategories(preset, customCategories);

  const zip = new JSZip();

  // 1. Standard Favicons
  if (includeStandard) {
    const png16 = await canvasToPngBytes(renderResizedCanvas(squareImg, 16, 16, { autotrim: true, sharpen: true }));
    const png32 = await canvasToPngBytes(renderResizedCanvas(squareImg, 32, 32, { autotrim: true, sharpen: true }));
    const png48 = await canvasToPngBytes(renderResizedCanvas(squareImg, 48, 48, { autotrim: true, sharpen: true }));
    const png96 = await canvasToPngBytes(renderResizedCanvas(squareImg, 96, 96, { autotrim: true, sharpen: true }));
    const png128 = await canvasToPngBytes(renderResizedCanvas(squareImg, 128, 128, { autotrim: true, sharpen: false }));
    const png196 = await canvasToPngBytes(renderResizedCanvas(squareImg, 196, 196, { autotrim: true, sharpen: false }));

    const icoBytes = buildIcoFile([
      { width: 16, height: 16, pngBytes: png16 },
      { width: 32, height: 32, pngBytes: png32 },
      { width: 48, height: 48, pngBytes: png48 },
    ]);

    zip.file('favicon.ico', icoBytes);
    zip.file('favicon-16x16.png', png16);
    zip.file('favicon-32x32.png', png32);
    zip.file('favicon-48x48.png', png48);
    zip.file('favicon-96x96.png', png96);
    zip.file('favicon-128.png', png128);
    zip.file('favicon-196x196.png', png196);
  }

  // 2. Apple iOS
  if (includeApple) {
    const appleBg = metadata.backgroundColor || '#ffffff';
    const apple180 = await canvasToPngBytes(renderResizedCanvas(squareImg, 180, 180, { bgColor: appleBg, autotrim: true, sharpen: false }));
    zip.file('apple-touch-icon.png', apple180);
    zip.file('apple-touch-icon-precomposed.png', apple180);

    const legacySizes = [57, 60, 72, 76, 114, 120, 144, 152];
    for (const size of legacySizes) {
      const appleLegacy = await canvasToPngBytes(
        renderResizedCanvas(squareImg, size, size, { bgColor: appleBg, autotrim: true, sharpen: size <= 96 })
      );
      zip.file(`apple-touch-icon-${size}x${size}.png`, appleLegacy);
    }

    const svgMask = generateMonochromeSvg(squareImg);
    zip.file('safari-pinned-tab.svg', svgMask);
  }

  // 3. Android & PWA
  if (includeAndroid) {
    const android192 = await canvasToPngBytes(renderResizedCanvas(squareImg, 192, 192, { autotrim: false, sharpen: false }));
    const android512 = await canvasToPngBytes(renderResizedCanvas(squareImg, 512, 512, { autotrim: false, sharpen: false }));

    zip.file('android-chrome-192x192.png', android192);
    zip.file('android-chrome-512x512.png', android512);
    zip.file('site.webmanifest', generateWebmanifest(metadata));
  }

  // 4. Windows Microsoft Tiles
  if (includeWindows) {
    const mstile70 = await canvasToPngBytes(renderResizedCanvas(squareImg, 70, 70, { autotrim: true, sharpen: true }));
    const mstile144 = await canvasToPngBytes(renderResizedCanvas(squareImg, 144, 144, { autotrim: true, sharpen: false }));
    const mstile150 = await canvasToPngBytes(renderResizedCanvas(squareImg, 150, 150, { autotrim: true, sharpen: false }));
    const mstile310 = await canvasToPngBytes(renderResizedCanvas(squareImg, 310, 310, { autotrim: true, sharpen: false }));

    zip.file('mstile-70x70.png', mstile70);
    zip.file('mstile-144x144.png', mstile144);
    zip.file('mstile-150x150.png', mstile150);
    zip.file('mstile-310x310.png', mstile310);

    // Wide Tile (310x150)
    let mstileWide: Uint8Array;
    if (horizontalImg) {
      mstileWide = await canvasToPngBytes(renderResizedCanvas(horizontalImg, 310, 150, { autotrim: false, fit: true }));
    } else {
      mstileWide = await canvasToPngBytes(
        renderResizedCanvas(squareImg, 310, 150, { bgColor: metadata.themeColor || '#004643', autotrim: true, fit: true })
      );
    }
    zip.file('mstile-310x150.png', mstileWide);
    zip.file('browserconfig.xml', generateBrowserconfig(metadata));
  }

  // 5. Social & WhatsApp Cards (1200x630)
  if (includeSocial) {
    let socialPng: Uint8Array;
    if (horizontalImg) {
      socialPng = await canvasToPngBytes(renderResizedCanvas(horizontalImg, 1200, 630, { autotrim: false, fit: true }));
    } else {
      // Create card fallback with centered square logo
      const cardCanvas = document.createElement('canvas');
      cardCanvas.width = 1200;
      cardCanvas.height = 630;
      const cardCtx = cardCanvas.getContext('2d')!;

      const rgb = hexToRgb(metadata.backgroundColor || '#121212', [18, 18, 18]);
      cardCtx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      cardCtx.fillRect(0, 0, 1200, 630);

      const logoCanvas = renderResizedCanvas(squareImg, 320, 320, { autotrim: true, fit: true });
      const pasteX = Math.floor((1200 - 320) / 2);
      const pasteY = Math.floor((630 - 320) / 2);
      cardCtx.drawImage(logoCanvas, pasteX, pasteY);

      socialPng = await canvasToPngBytes(cardCanvas);
    }

    zip.file('og-image.png', socialPng);
    zip.file('twitter-image.png', socialPng);
  }

  // 6. Documentation and Multi-Framework Embed Snippets
  const htmlSnippet = generateHtmlSnippet(metadata, preset, customCategories);
  const nextjsSnippet = generateNextJsSnippet(metadata, preset, customCategories);
  const viteSnippet = generateViteSnippet(metadata, preset, customCategories);
  const readmeContent = generateReadme(metadata);

  zip.file('snippet-html.txt', htmlSnippet);
  zip.file('snippet-nextjs.txt', nextjsSnippet);
  zip.file('snippet-vite.txt', viteSnippet);
  zip.file('code.txt', htmlSnippet);
  zip.file('head-tags.html', htmlSnippet);
  zip.file('README.md', readmeContent);

  // Generate and return compressed ZIP blob
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}
