"""FastAPI entry point for the Favicon Generator backend."""

import json
from typing import Optional
from fastapi import FastAPI, File, Form, HTTPException, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.generator import generate_favicons, generate_head_tags_html
from app.models import CategorySelection, FaviconMetadata, PresetMode

app = FastAPI(
    title="Favicon & Social Asset Generator API",
    description="Generate multi-resolution favicons, social media preview cards, manifests, and embed code.",
    version="1.0.0",
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify backend connectivity."""
    return {
        "status": "healthy",
        "service": "favicon-generator-api",
        "version": "1.0.0",
        "port": 1947,
    }


def generate_nextjs_snippet(meta: FaviconMetadata) -> str:
    """Generate Next.js App Router metadata configuration."""
    domain = meta.site_url.replace("https://", "").replace("http://", "").rstrip("/")
    return f"""import type {{ Metadata }} from 'next';

export const metadata: Metadata = {{
  title: '{meta.app_name}',
  description: '{meta.description}',
  metadataBase: new URL('{meta.site_url}'),
  icons: {{
    icon: [
      {{ url: '/favicon.ico' }},
      {{ url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }},
      {{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }},
    ],
    apple: [
      {{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }},
    ],
  }},
  manifest: '/site.webmanifest',
  openGraph: {{
    title: '{meta.app_name}',
    description: '{meta.description}',
    url: '{meta.site_url}',
    siteName: '{meta.app_name}',
    images: [
      {{
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '{meta.app_name}',
      }},
    ],
    type: 'website',
  }},
  twitter: {{
    card: 'summary_large_image',
    title: '{meta.app_name}',
    description: '{meta.description}',
    images: ['/twitter-image.png'],
  }},
}};"""


def generate_vite_snippet(meta: FaviconMetadata) -> str:
    """Generate HTML snippet formatted for Vite / Astro index.html."""
    return generate_head_tags_html(meta, PresetMode.STANDARD)


@app.post("/api/snippets")
async def get_snippets(metadata: FaviconMetadata):
    """Generate live copy-paste code snippets for multiple frameworks."""
    return {
        "html_head": generate_head_tags_html(metadata, PresetMode.STANDARD),
        "nextjs_metadata": generate_nextjs_snippet(metadata),
        "vite_html": generate_vite_snippet(metadata),
    }


@app.post("/api/generate")
async def generate_assets(
    square_image: UploadFile = File(...),
    horizontal_image: Optional[UploadFile] = File(None),
    app_name: str = Form("My Web App"),
    short_name: str = Form("App"),
    theme_color: str = Form("#2563eb"),
    background_color: str = Form("#ffffff"),
    site_url: str = Form("https://example.com"),
    description: str = Form("Modern web application with full favicon & social share asset support."),
    preset: str = Form("standard"),
    custom_categories_json: Optional[str] = Form(None),
):
    """
    Generate all requested favicon and social share assets packaged into a ZIP archive.
    """
    try:
        square_bytes = await square_image.read()
        if not square_bytes:
            raise HTTPException(status_code=400, detail="Square image file cannot be empty.")

        horizontal_bytes = None
        if horizontal_image:
            horizontal_bytes = await horizontal_image.read()
            if len(horizontal_bytes) == 0:
                horizontal_bytes = None

        meta = FaviconMetadata(
            app_name=app_name,
            short_name=short_name,
            theme_color=theme_color,
            background_color=background_color,
            site_url=site_url,
            description=description,
        )

        preset_mode = PresetMode(preset.lower()) if preset in [p.value for p in PresetMode] else PresetMode.STANDARD

        custom_cats = None
        if custom_categories_json:
            try:
                cats_dict = json.loads(custom_categories_json)
                custom_cats = CategorySelection(**cats_dict)
            except Exception:
                custom_cats = None

        zip_bytes = generate_favicons(
            square_image_bytes=square_bytes,
            horizontal_image_bytes=horizontal_bytes,
            metadata=meta,
            preset=preset_mode,
            custom_categories=custom_cats,
        )

        filename = f"{short_name.lower().replace(' ', '-')}-favicons.zip"
        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(zip_bytes)),
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate favicon bundle: {str(e)}")
