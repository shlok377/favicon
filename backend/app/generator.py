"""Core image processing and favicon bundle generator engine."""

import io
import json
import xml.etree.ElementTree as ET
import zipfile
from typing import Dict, Optional, Tuple
from PIL import Image, ImageColor, ImageFilter, ImageOps

from app.models import CategorySelection, FaviconMetadata, PresetMode


def hex_to_rgb(hex_color: str, default: Tuple[int, int, int] = (255, 255, 255)) -> Tuple[int, int, int]:
    """Convert hex color string to RGB tuple with safe fallback."""
    try:
        return ImageColor.getrgb(hex_color)
    except Exception:
        return default


def load_image(image_bytes: bytes) -> Image.Image:
    """Load image from bytes and ensure RGBA mode."""
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    return img


def trim_transparent_borders(img: Image.Image, padding_pct: float = 0.05) -> Image.Image:
    """
    Auto-trim excess transparent margins so the logo maximizes the icon canvas,
    adding a small aesthetic safe-zone padding.
    """
    if img.mode != "RGBA":
        img = img.convert("RGBA")
        
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    if not bbox:
        return img  # Entirely transparent or empty
        
    # Crop to content
    cropped = img.crop(bbox)
    
    # Calculate square bounding box with safe padding
    max_dim = max(cropped.width, cropped.height)
    pad = int(max_dim * padding_pct)
    canvas_size = max_dim + (pad * 2)
    
    square_canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    paste_x = (canvas_size - cropped.width) // 2
    paste_y = (canvas_size - cropped.height) // 2
    square_canvas.paste(cropped, (paste_x, paste_y), cropped)
    return square_canvas


def clean_alpha_fringing(img: Image.Image) -> Image.Image:
    """
    Clean up RGB values of transparent/semi-transparent pixels to avoid dark halos during resampling.
    """
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    return img


def adaptive_sharpen_icon(img: Image.Image, target_size: int) -> Image.Image:
    """
    Apply calibrated unsharp masking tailored to small icon dimensions (16, 32, 48)
    to restore edge contrast and micro-sharpness lost during massive downsampling.
    """
    if target_size <= 16:
        # High unsharp mask for 16x16
        return img.filter(ImageFilter.UnsharpMask(radius=0.6, percent=170, threshold=1))
    elif target_size <= 32:
        # Moderate unsharp mask for 32x32
        return img.filter(ImageFilter.UnsharpMask(radius=0.7, percent=140, threshold=1))
    elif target_size <= 48:
        # Subtle unsharp mask for 48x48
        return img.filter(ImageFilter.UnsharpMask(radius=0.8, percent=120, threshold=2))
    elif target_size <= 96:
        # Very subtle sharpening for 96x96
        return img.filter(ImageFilter.UnsharpMask(radius=0.9, percent=100, threshold=2))
    return img


def progressive_downscale(image: Image.Image, target_size: Tuple[int, int]) -> Image.Image:
    """
    Downscale in multiple progressive steps if the scaling factor is large (> 3x),
    preventing aliasing and pixel loss.
    """
    current_w, current_h = image.size
    target_w, target_h = target_size
    
    img = image
    while current_w > target_w * 2 and current_h > target_h * 2:
        current_w = max(target_w, current_w // 2)
        current_h = max(target_h, current_h // 2)
        img = img.resize((current_w, current_h), Image.Resampling.LANCZOS)
        
    return img.resize((target_w, target_h), Image.Resampling.LANCZOS)


def resize_image(
    image: Image.Image,
    size: Tuple[int, int],
    fit: bool = True,
    bg_color: Optional[str] = None,
    autotrim: bool = True,
    sharpen: bool = True,
) -> Image.Image:
    """
    High-fidelity icon resizing using autotrimming, progressive downscaling,
    and adaptive unsharp masking.
    """
    target_w, target_h = size
    
    # Auto-trim transparent borders if requested and applicable
    if autotrim and size[0] <= 180 and image.width == image.height:
        work_img = trim_transparent_borders(image, padding_pct=0.04)
    else:
        work_img = image

    if fit:
        # Scale to fit within bounds
        ratio = min(target_w / work_img.width, target_h / work_img.height)
        new_w = max(1, int(work_img.width * ratio))
        new_h = max(1, int(work_img.height * ratio))
        
        resized = progressive_downscale(work_img, (new_w, new_h))
        
        if sharpen and max(new_w, new_h) <= 96:
            resized = adaptive_sharpen_icon(resized, max(new_w, new_h))
        
        # Create canvas
        if bg_color and bg_color.lower() != "transparent":
            rgb = hex_to_rgb(bg_color)
            canvas = Image.new("RGBA", size, (*rgb, 255))
        else:
            canvas = Image.new("RGBA", size, (0, 0, 0, 0))
        
        paste_x = (target_w - new_w) // 2
        paste_y = (target_h - new_h) // 2
        canvas.paste(resized, (paste_x, paste_y), resized)
        return canvas
    else:
        resized = progressive_downscale(work_img, size)
        if sharpen and max(target_w, target_h) <= 96:
            resized = adaptive_sharpen_icon(resized, max(target_w, target_h))
        return resized


def generate_ico(image_bytes: bytes) -> bytes:
    """
    Generate professional multi-resolution .ico containing individually rendered
    and sharpened 16x16, 32x32, and 48x48 frames.
    """
    base_img = load_image(image_bytes)
    
    # Pre-render each frame with optimized sharpness
    img_16 = resize_image(base_img, (16, 16), fit=True, autotrim=True, sharpen=True)
    img_32 = resize_image(base_img, (32, 32), fit=True, autotrim=True, sharpen=True)
    img_48 = resize_image(base_img, (48, 48), fit=True, autotrim=True, sharpen=True)
    
    out_buf = io.BytesIO()
    # Save multi-frame ICO containing all 3 resolutions
    img_48.save(
        out_buf,
        format="ICO",
        append_images=[img_16, img_32],
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    return out_buf.getvalue()


def generate_png(image: Image.Image, size: Tuple[int, int], bg_color: Optional[str] = None) -> bytes:
    """Generate a single PNG image at specified dimensions with high sharpness."""
    resized = resize_image(image, size, fit=True, bg_color=bg_color, autotrim=True, sharpen=True)
    out_buf = io.BytesIO()
    resized.save(out_buf, format="PNG", optimize=True)
    return out_buf.getvalue()


def create_social_card_fallback(
    square_bytes: bytes,
    bg_color: str = "#121212",
    app_name: str = "Web App",
) -> bytes:
    """
    Generate a 1200x630 social share card by centering the square logo
    on a solid background canvas.
    """
    square_img = load_image(square_bytes)
    target_w, target_h = (1200, 630)
    
    # Background
    rgb = hex_to_rgb(bg_color, (18, 18, 18))
    canvas = Image.new("RGBA", (target_w, target_h), (*rgb, 255))
    
    # Scale square logo to ~320x320 centered
    logo_size = 320
    logo_resized = resize_image(square_img, (logo_size, logo_size), fit=True)
    
    paste_x = (target_w - logo_size) // 2
    paste_y = (target_h - logo_size) // 2
    canvas.paste(logo_resized, (paste_x, paste_y), logo_resized)
    
    out_buf = io.BytesIO()
    canvas.convert("RGB").save(out_buf, format="PNG", optimize=True)
    return out_buf.getvalue()


def generate_monochrome_svg(image_bytes: bytes) -> str:
    """
    Generate a monochrome silhouette SVG mask (for Safari pinned tab).
    Uses high-contrast alpha thresholding.
    """
    img = load_image(image_bytes)
    # Downscale for crisp vector silhouette extraction
    small = img.resize((64, 64), Image.Resampling.LANCZOS)
    
    # Extract alpha mask or convert RGB luminance to mask
    alpha = small.split()[-1]
    
    # Build simple clean SVG with path/rects or embedded SVG mask
    svg_lines = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
    ]
    
    # Walk pixels and render pixel grid / solid silhouette
    pixels = alpha.load()
    for y in range(64):
        for x in range(64):
            if pixels[x, y] > 128:  # threshold
                svg_lines.append(f'  <rect x="{x}" y="{y}" width="1" height="1" fill="#000000" />')
                
    svg_lines.append("</svg>")
    return "\n".join(svg_lines)


def generate_webmanifest(metadata: FaviconMetadata) -> str:
    """Generate modern site.webmanifest JSON."""
    manifest = {
        "name": metadata.app_name,
        "short_name": metadata.short_name,
        "icons": [
            {
                "src": "/favicon-96x96.png",
                "sizes": "96x96",
                "type": "image/png",
            },
            {
                "src": "/favicon-196x196.png",
                "sizes": "196x196",
                "type": "image/png",
            },
            {
                "src": "/android-chrome-192x192.png",
                "sizes": "192x192",
                "type": "image/png",
            },
            {
                "src": "/android-chrome-512x512.png",
                "sizes": "512x512",
                "type": "image/png",
            },
        ],
        "theme_color": metadata.theme_color,
        "background_color": metadata.background_color,
        "display": "standalone",
        "start_url": "/",
    }
    return json.dumps(manifest, indent=2)


def generate_browserconfig(metadata: FaviconMetadata) -> str:
    """Generate browserconfig.xml for Microsoft Windows tiles."""
    xml = f"""<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="/mstile-70x70.png"/>
      <square144x144logo src="/mstile-144x144.png"/>
      <square150x150logo src="/mstile-150x150.png"/>
      <wide310x150logo src="/mstile-310x150.png"/>
      <square310x310logo src="/mstile-310x310.png"/>
      <TileColor>{metadata.theme_color}</TileColor>
    </tile>
  </msapplication>
</browserconfig>"""
    return xml


def generate_html_snippet(metadata: FaviconMetadata, preset: PresetMode = PresetMode.STANDARD) -> str:
    """Generate ready-to-copy HTML <head> tags including standard & legacy compatibility."""
    lines = [
        "<!-- Favicon & Browser Icons -->",
        '<link rel="icon" type="image/x-icon" href="/favicon.ico">',
        '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
        '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
        '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">',
        '<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">',
        '<link rel="icon" type="image/png" sizes="128x128" href="/favicon-128.png">',
        '<link rel="icon" type="image/png" sizes="196x196" href="/favicon-196x196.png">',
        "",
        "<!-- Apple Touch Icons (iOS) -->",
        '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
        '<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">',
        '<link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">',
        '<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">',
        '<link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">',
        '<link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png">',
        '<link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png">',
        '<link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png">',
        '<link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png">',
    ]

    if preset != PresetMode.MINIMAL:
        lines.extend([
            f'<link rel="mask-icon" href="/safari-pinned-tab.svg" color="{metadata.theme_color}">',
            '<link rel="manifest" href="/site.webmanifest">',
            f'<meta name="theme-color" content="{metadata.theme_color}">',
            f'<meta name="msapplication-TileColor" content="{metadata.theme_color}">',
            '<meta name="msapplication-TileImage" content="/mstile-144x144.png">',
            '<meta name="msapplication-config" content="/browserconfig.xml">',
            "",
            "<!-- Open Graph / Facebook / WhatsApp Share Cards -->",
            '<meta property="og:type" content="website">',
            f'<meta property="og:url" content="{metadata.site_url}">',
            f'<meta property="og:title" content="{metadata.app_name}">',
            f'<meta property="og:description" content="{metadata.description}">',
            f'<meta property="og:image" content="{metadata.site_url.rstrip("/")}/og-image.png">',
            "",
            "<!-- Twitter Card -->",
            '<meta name="twitter:card" content="summary_large_image">',
            f'<meta property="twitter:domain" content="{metadata.site_url.replace("https://", "").replace("http://", "").rstrip("/")}">',
            f'<meta property="twitter:url" content="{metadata.site_url}">',
            f'<meta name="twitter:title" content="{metadata.app_name}">',
            f'<meta name="twitter:description" content="{metadata.description}">',
            f'<meta name="twitter:image" content="{metadata.site_url.rstrip("/")}/twitter-image.png">',
        ])

    return "\n".join(lines)


def generate_head_tags_html(metadata: FaviconMetadata, preset: PresetMode = PresetMode.STANDARD) -> str:
    """Generate ready-to-copy HTML <head> tags."""
    return generate_html_snippet(metadata, preset)


def generate_nextjs_snippet(metadata: FaviconMetadata, preset: PresetMode = PresetMode.STANDARD) -> str:
    """Generate Next.js App Router metadata configuration."""
    clean_url = metadata.site_url.rstrip("/")
    return f"""// app/layout.tsx (Next.js App Router)
import type {{ Metadata }} from 'next';

export const metadata: Metadata = {{
  title: '{metadata.app_name}',
  description: '{metadata.description}',
  metadataBase: new URL('{clean_url}'),
  icons: {{
    icon: [
      {{ url: '/favicon.ico' }},
      {{ url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }},
      {{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }},
      {{ url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' }},
      {{ url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }},
      {{ url: '/favicon-128.png', sizes: '128x128', type: 'image/png' }},
      {{ url: '/favicon-196x196.png', sizes: '196x196', type: 'image/png' }},
    ],
    apple: [
      {{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }},
      {{ url: '/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' }},
      {{ url: '/apple-touch-icon-144x144.png', sizes: '144x144', type: 'image/png' }},
      {{ url: '/apple-touch-icon-120x120.png', sizes: '120x120', type: 'image/png' }},
      {{ url: '/apple-touch-icon-114x114.png', sizes: '114x114', type: 'image/png' }},
      {{ url: '/apple-touch-icon-76x76.png', sizes: '76x76', type: 'image/png' }},
      {{ url: '/apple-touch-icon-72x72.png', sizes: '72x72', type: 'image/png' }},
      {{ url: '/apple-touch-icon-60x60.png', sizes: '60x60', type: 'image/png' }},
      {{ url: '/apple-touch-icon-57x57.png', sizes: '57x57', type: 'image/png' }},
    ],
    other: [
      {{
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '{metadata.theme_color}',
      }},
    ],
  }},
  manifest: '/site.webmanifest',
  openGraph: {{
    title: '{metadata.app_name}',
    description: '{metadata.description}',
    url: '{clean_url}',
    siteName: '{metadata.app_name}',
    images: [
      {{
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '{metadata.app_name}',
      }},
    ],
    type: 'website',
  }},
  twitter: {{
    card: 'summary_large_image',
    title: '{metadata.app_name}',
    description: '{metadata.description}',
    images: ['/twitter-image.png'],
  }},
}};"""


def generate_vite_snippet(metadata: FaviconMetadata, preset: PresetMode = PresetMode.STANDARD) -> str:
    """Generate Vite / SPA HTML template snippet."""
    html_code = generate_html_snippet(metadata, preset)
    return f"""<!-- Vite / SPA Integration (index.html) -->
<!-- 1. Extract all icons and manifests directly into your Vite project's "public/" directory -->
<!-- 2. Paste the following tags inside the <head> of your index.html: -->

{html_code}

<!-- Tip for vite-plugin-pwa (optional in vite.config.ts):
import {{ defineConfig }} from 'vite';
import {{ VitePWA }} from 'vite-plugin-pwa';

export default defineConfig({{
  plugins: [
    VitePWA({{
      manifest: false, // uses the included site.webmanifest from public/
    }}),
  ],
}});
-->"""


def generate_readme(metadata: FaviconMetadata) -> str:
    """Generate a clean README.md guide for the downloaded assets."""
    return f"""# {metadata.app_name} Favicon & Asset Pack

All files in this zip archive are organized with a flat structure and ready to be placed directly into your web project's `public/` (or `static/`) directory.

## 📁 Included Assets

1. **Favicons & Browser Icons**:
   - `favicon.ico` (Multi-resolution: 16x16, 32x32, 48x48)
   - `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`, `favicon-96x96.png`
   - `favicon-128.png` (Chrome Web Store / legacy desktop)
   - `favicon-196x196.png` (Legacy Android home screen)

2. **Apple iOS Touch Icons**:
   - `apple-touch-icon.png` (180x180 modern iOS standard)
   - `apple-touch-icon-precomposed.png` (180x180)
   - Legacy iOS sizes: `57x57`, `60x60`, `72x72`, `76x76`, `114x114`, `120x120`, `144x144`, `152x152`
   - `safari-pinned-tab.svg` (Monochrome vector mask)

3. **Android & PWA**:
   - `android-chrome-192x192.png`, `android-chrome-512x512.png`
   - `site.webmanifest` (App Name: "{metadata.app_name}", Theme Color: {metadata.theme_color})

4. **Windows Tiles & Config**:
   - `mstile-70x70.png`, `mstile-144x144.png`, `mstile-150x150.png`, `mstile-310x150.png`, `mstile-310x310.png`
   - `browserconfig.xml`

5. **Social & WhatsApp Sharing Cards**:
   - `og-image.png` (1200x630 OpenGraph card)
   - `twitter-image.png` (1200x630 Twitter card)

6. **Embed Snippets**:
   - `snippet-html.txt` (Standard HTML `<head>` tags)
   - `snippet-nextjs.txt` (Next.js App Router metadata object)
   - `snippet-vite.txt` (Vite index.html tags & PWA guide)
   - `code.txt` (Favic-o-matic compatible HTML snippet)
   - `head-tags.html` (HTML snippet in HTML format)

## 🚀 How to Use

1. Unzip and copy all files to your project's `public/` (or `static/`) folder.
2. Choose your preferred snippet file:
   - For HTML/PHP/Static: copy from `snippet-html.txt` or `head-tags.html`
   - For Next.js: copy `metadata` from `snippet-nextjs.txt` into `app/layout.tsx`
   - For Vite/React/Vue: copy tags from `snippet-vite.txt` into `index.html`

Generated with Favicon & Social Asset Generator.
"""


def generate_favicons(
    square_image_bytes: bytes,
    horizontal_image_bytes: Optional[bytes] = None,
    metadata: Optional[FaviconMetadata] = None,
    preset: PresetMode = PresetMode.STANDARD,
    custom_categories: Optional[CategorySelection] = None,
) -> bytes:
    """
    Main generator pipeline producing in-memory ZIP archive of all requested assets.
    """
    if metadata is None:
        metadata = FaviconMetadata()

    square_img = load_image(square_image_bytes)
    
    # Load horizontal image if provided, else use auto-fallback
    horizontal_img = load_image(horizontal_image_bytes) if horizontal_image_bytes else None

    # Categories to include
    include_standard = True
    include_apple = True
    include_android = True
    include_windows = True
    include_social = True

    if preset == PresetMode.MINIMAL:
        include_android = False
        include_windows = False
        include_social = False
    elif preset == PresetMode.CUSTOM and custom_categories:
        include_standard = custom_categories.standard_favicons
        include_apple = custom_categories.apple_ios
        include_android = custom_categories.android_pwa
        include_windows = custom_categories.windows_tiles
        include_social = custom_categories.social_cards

    files_to_zip: Dict[str, bytes] = {}

    # 1. Standard Favicons
    if include_standard:
        files_to_zip["favicon.ico"] = generate_ico(square_image_bytes)
        files_to_zip["favicon-16x16.png"] = generate_png(square_img, (16, 16))
        files_to_zip["favicon-32x32.png"] = generate_png(square_img, (32, 32))
        files_to_zip["favicon-48x48.png"] = generate_png(square_img, (48, 48))
        files_to_zip["favicon-96x96.png"] = generate_png(square_img, (96, 96))
        files_to_zip["favicon-128.png"] = generate_png(square_img, (128, 128))
        files_to_zip["favicon-196x196.png"] = generate_png(square_img, (196, 196))

    # 2. Apple iOS
    if include_apple:
        files_to_zip["apple-touch-icon.png"] = generate_png(square_img, (180, 180), bg_color=metadata.background_color)
        files_to_zip["apple-touch-icon-precomposed.png"] = generate_png(square_img, (180, 180), bg_color=metadata.background_color)
        # Legacy Favic-o-matic sizes for complete backward compatibility
        for size in [57, 60, 72, 76, 114, 120, 144, 152]:
            files_to_zip[f"apple-touch-icon-{size}x{size}.png"] = generate_png(square_img, (size, size), bg_color=metadata.background_color)
        files_to_zip["safari-pinned-tab.svg"] = generate_monochrome_svg(square_image_bytes).encode("utf-8")

    # 3. Android & PWA
    if include_android:
        files_to_zip["android-chrome-192x192.png"] = generate_png(square_img, (192, 192))
        files_to_zip["android-chrome-512x512.png"] = generate_png(square_img, (512, 512))
        files_to_zip["site.webmanifest"] = generate_webmanifest(metadata).encode("utf-8")

    # 4. Windows Microsoft Tiles
    if include_windows:
        files_to_zip["mstile-70x70.png"] = generate_png(square_img, (70, 70))
        files_to_zip["mstile-144x144.png"] = generate_png(square_img, (144, 144))
        files_to_zip["mstile-150x150.png"] = generate_png(square_img, (150, 150))
        files_to_zip["mstile-310x310.png"] = generate_png(square_img, (310, 310))
        
        # Wide tile (310x150)
        if horizontal_img:
            files_to_zip["mstile-310x150.png"] = generate_png(horizontal_img, (310, 150))
        else:
            files_to_zip["mstile-310x150.png"] = generate_png(square_img, (310, 150), bg_color=metadata.theme_color)
            
        files_to_zip["browserconfig.xml"] = generate_browserconfig(metadata).encode("utf-8")

    # 5. Social & WhatsApp OpenGraph cards (1200x630)
    if include_social:
        if horizontal_img:
            social_png = generate_png(horizontal_img, (1200, 630))
        else:
            social_png = create_social_card_fallback(
                square_image_bytes,
                bg_color=metadata.background_color,
                app_name=metadata.app_name,
            )
        files_to_zip["og-image.png"] = social_png
        files_to_zip["twitter-image.png"] = social_png

    # 6. Documentation and Multi-Framework Embed Snippets (.txt & .html)
    html_snippet = generate_html_snippet(metadata, preset)
    nextjs_snippet = generate_nextjs_snippet(metadata, preset)
    vite_snippet = generate_vite_snippet(metadata, preset)

    files_to_zip["snippet-html.txt"] = html_snippet.encode("utf-8")
    files_to_zip["snippet-nextjs.txt"] = nextjs_snippet.encode("utf-8")
    files_to_zip["snippet-vite.txt"] = vite_snippet.encode("utf-8")
    files_to_zip["code.txt"] = html_snippet.encode("utf-8")
    files_to_zip["head-tags.html"] = html_snippet.encode("utf-8")
    files_to_zip["README.md"] = generate_readme(metadata).encode("utf-8")

    # Package all files into in-memory ZIP archive
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for filename, content in files_to_zip.items():
            zip_file.writestr(filename, content)

    return zip_buffer.getvalue()
