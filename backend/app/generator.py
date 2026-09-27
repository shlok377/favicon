"""Core image processing and favicon bundle generator engine."""

import io
import json
import xml.etree.ElementTree as ET
import zipfile
from typing import Dict, Optional, Tuple
from PIL import Image, ImageColor, ImageOps

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


def resize_image(image: Image.Image, size: Tuple[int, int], fit: bool = True, bg_color: Optional[str] = None) -> Image.Image:
    """
    Resize image to target size using high-quality Lanczos resampling.
    If fit is True, keeps aspect ratio and pads to fit size.
    """
    target_w, target_h = size
    if fit:
        # Scale to fit within bounds
        ratio = min(target_w / image.width, target_h / image.height)
        new_w = max(1, int(image.width * ratio))
        new_h = max(1, int(image.height * ratio))
        resized = image.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
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
        return image.resize(size, Image.Resampling.LANCZOS)


def generate_ico(image_bytes: bytes) -> bytes:
    """Generate multi-resolution .ico containing 16x16, 32x32, and 48x48 frames."""
    base_img = load_image(image_bytes)
    # Generate 48x48 base image for ICO
    img_48 = resize_image(base_img, (48, 48))
    
    out_buf = io.BytesIO()
    # Save as multi-layer ICO
    img_48.save(
        out_buf,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    return out_buf.getvalue()


def generate_png(image: Image.Image, size: Tuple[int, int], bg_color: Optional[str] = None) -> bytes:
    """Generate a single PNG image at specified dimensions."""
    resized = resize_image(image, size, fit=True, bg_color=bg_color)
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
      <square150x150logo src="/mstile-150x150.png"/>
      <wide310x150logo src="/mstile-310x150.png"/>
      <square310x310logo src="/mstile-310x310.png"/>
      <TileColor>{metadata.theme_color}</TileColor>
    </tile>
  </msapplication>
</browserconfig>"""
    return xml


def generate_head_tags_html(metadata: FaviconMetadata, preset: PresetMode = PresetMode.STANDARD) -> str:
    """Generate ready-to-copy HTML <head> tags."""
    lines = [
        "<!-- Favicon & App Icons -->",
        '<link rel="icon" type="image/x-icon" href="/favicon.ico">',
        '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
        '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
        '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
    ]

    if preset != PresetMode.MINIMAL:
        lines.extend([
            f'<link rel="mask-icon" href="/safari-pinned-tab.svg" color="{metadata.theme_color}">',
            '<link rel="manifest" href="/site.webmanifest">',
            f'<meta name="msapplication-TileColor" content="{metadata.theme_color}">',
            '<meta name="msapplication-config" content="/browserconfig.xml">',
            f'<meta name="theme-color" content="{metadata.theme_color}">',
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


def generate_readme(metadata: FaviconMetadata) -> str:
    """Generate a clean README.md guide for the downloaded assets."""
    return f"""# {metadata.app_name} Favicon & Asset Pack

All files in this zip archive are organized with a flat structure and ready to be placed directly into your web project's `public/` (or `static/`) directory.

## 📁 Included Assets

1. **Favicons & Browser Icons**:
   - `favicon.ico` (Multi-resolution: 16x16, 32x32, 48x48)
   - `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`
   - `apple-touch-icon.png` (180x180 for iOS Home Screen)
   - `safari-pinned-tab.svg` (Monochrome mask icon)

2. **Android & PWA**:
   - `android-chrome-192x192.png`, `android-chrome-512x512.png`
   - `site.webmanifest` (App Name: "{metadata.app_name}", Theme Color: {metadata.theme_color})

3. **Windows Tiles**:
   - `mstile-70x70.png`, `mstile-150x150.png`, `mstile-310x150.png`, `mstile-310x310.png`
   - `browserconfig.xml`

4. **Social & WhatsApp Sharing Cards**:
   - `og-image.png` (1200x630 OpenGraph card)
   - `twitter-image.png` (1200x630 Twitter card)

## 🚀 How to Use

1. Unzip and copy all files to your project's `public/` folder.
2. Copy the HTML code from `head-tags.html` into your `<head>` section in `index.html` or layout template.

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

    # 2. Apple iOS
    if include_apple:
        files_to_zip["apple-touch-icon.png"] = generate_png(square_img, (180, 180), bg_color=metadata.background_color)
        files_to_zip["apple-touch-icon-precomposed.png"] = generate_png(square_img, (180, 180), bg_color=metadata.background_color)
        files_to_zip["safari-pinned-tab.svg"] = generate_monochrome_svg(square_image_bytes).encode("utf-8")

    # 3. Android & PWA
    if include_android:
        files_to_zip["android-chrome-192x192.png"] = generate_png(square_img, (192, 192))
        files_to_zip["android-chrome-512x512.png"] = generate_png(square_img, (512, 512))
        files_to_zip["site.webmanifest"] = generate_webmanifest(metadata).encode("utf-8")

    # 4. Windows Microsoft Tiles
    if include_windows:
        files_to_zip["mstile-70x70.png"] = generate_png(square_img, (70, 70))
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

    # 6. Documentation and Embed Snippet
    files_to_zip["head-tags.html"] = generate_head_tags_html(metadata, preset).encode("utf-8")
    files_to_zip["README.md"] = generate_readme(metadata).encode("utf-8")

    # Package all files into in-memory ZIP archive
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for filename, content in files_to_zip.items():
            zip_file.writestr(filename, content)

    return zip_buffer.getvalue()
