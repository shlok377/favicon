import io
import zipfile
import pytest
from httpx import AsyncClient, ASGITransport
from PIL import Image
from app.main import app


def create_test_image(width=256, height=256) -> bytes:
    img = Image.new("RGBA", (width, height), (37, 99, 235, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.mark.asyncio
async def test_generate_endpoint_with_square_only():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        img_bytes = create_test_image()
        files = {
            "square_image": ("logo.png", img_bytes, "image/png"),
        }
        data = {
            "app_name": "Test App",
            "short_name": "Test",
            "theme_color": "#2563eb",
            "background_color": "#ffffff",
            "site_url": "https://test.app",
            "description": "Awesome testing app",
            "preset": "standard",
        }
        response = await client.post("/api/generate", files=files, data=data)
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/zip"
        
        # Verify it's a valid ZIP
        zip_content = response.content
        with zipfile.ZipFile(io.BytesIO(zip_content)) as z:
            assert "favicon.ico" in z.namelist()
            assert "apple-touch-icon.png" in z.namelist()
            assert "og-image.png" in z.namelist()
            assert "site.webmanifest" in z.namelist()


@pytest.mark.asyncio
async def test_generate_snippets_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "app_name": "Next Vibe",
            "short_name": "Vibe",
            "theme_color": "#4f46e5",
            "background_color": "#ffffff",
            "site_url": "https://vibe.dev",
            "description": "Vibe coder web application",
        }
        response = await client.post("/api/snippets", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "html_head" in data
        assert "nextjs_metadata" in data
        assert "vite_html" in data
