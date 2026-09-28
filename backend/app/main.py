"""FastAPI entry point for the Favicon Generator backend."""

import json
from typing import Optional
from fastapi import FastAPI, File, Form, HTTPException, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.generator import (
    generate_favicons,
    generate_head_tags_html,
    generate_html_snippet,
    generate_nextjs_snippet,
    generate_vite_snippet,
)
from app.models import CategorySelection, FaviconMetadata, PresetMode

app = FastAPI(
    title="Favi - Favicon & Social Asset Generator API",
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


class SnippetsRequest(BaseModel):
    app_name: str = "My Web App"
    short_name: str = "App"
    theme_color: str = "#2563eb"
    background_color: str = "#ffffff"
    site_url: str = "https://example.com"
    description: str = "Modern web application with full favicon & social share asset support."
    preset: PresetMode = PresetMode.STANDARD
    custom_categories: Optional[CategorySelection] = None


@app.post("/api/snippets")
async def get_snippets(request: SnippetsRequest):
    """Generate live copy-paste code snippets for multiple frameworks."""
    meta = FaviconMetadata(
        app_name=request.app_name,
        short_name=request.short_name,
        theme_color=request.theme_color,
        background_color=request.background_color,
        site_url=request.site_url,
        description=request.description,
    )
    return {
        "html_head": generate_html_snippet(meta, request.preset, request.custom_categories),
        "nextjs_metadata": generate_nextjs_snippet(meta, request.preset, request.custom_categories),
        "vite_html": generate_vite_snippet(meta, request.preset, request.custom_categories),
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
