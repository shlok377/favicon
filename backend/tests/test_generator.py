import io
import json
import xml.etree.ElementTree as ET
import zipfile
import pytest
from PIL import Image
from app.generator import (
    generate_favicons,
    generate_ico,
    generate_monochrome_svg,
    create_social_card_fallback,
    generate_webmanifest,
    generate_browserconfig,
    generate_head_tags_html,
    generate_readme,
    FaviconMetadata,
    PresetMode,
)


def create_test_image(width=512, height=512, color=(37, 99, 235, 255)) -> bytes:
    """Helper to create a solid test PNG in-memory."""
    img = Image.new("RGBA", (width, height), color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_generate_ico():
    img_bytes = create_test_image(256, 256)
    ico_bytes = generate_ico(img_bytes)
    assert len(ico_bytes) > 0
    # Verify Pillow can open the generated ICO
    ico = Image.open(io.BytesIO(ico_bytes))
    assert ico.format == "ICO"
    assert ico.size == (48, 48)  # largest default frame


def test_create_social_card_fallback():
    square_bytes = create_test_image(512, 512, (255, 0, 0, 255))
    social_bytes = create_social_card_fallback(
        square_bytes,
        bg_color="#121212",
        app_name="Test App",
    )
    img = Image.open(io.BytesIO(social_bytes))
    assert img.size == (1200, 630)


def test_generate_monochrome_svg():
    img_bytes = create_test_image(200, 200)
    svg_str = generate_monochrome_svg(img_bytes)
    assert "<svg" in svg_str
    assert "</svg>" in svg_str


def test_generate_webmanifest():
    meta = FaviconMetadata(
        app_name="Vibe Launch",
        short_name="Vibe",
        theme_color="#2563eb",
        background_color="#121212",
    )
    manifest_json = generate_webmanifest(meta)
    data = json.loads(manifest_json)
    assert data["name"] == "Vibe Launch"
    assert data["short_name"] == "Vibe"
    assert data["theme_color"] == "#2563eb"
    assert data["background_color"] == "#121212"
    assert len(data["icons"]) >= 2


def test_generate_browserconfig():
    meta = FaviconMetadata(theme_color="#2563eb")
    xml_str = generate_browserconfig(meta)
    root = ET.fromstring(xml_str)
    assert root.tag == "browserconfig"
    tile = root.find(".//tile")
    assert tile is not None


def test_generate_favicons_standard_suite():
    square_bytes = create_test_image(512, 512)
    meta = FaviconMetadata(
        app_name="My Awesome Project",
        short_name="Awesome",
        theme_color="#2563eb",
        background_color="#ffffff",
        site_url="https://awesome.dev",
        description="A great project",
    )

    zip_bytes = generate_favicons(
        square_image_bytes=square_bytes,
        horizontal_image_bytes=None,
        metadata=meta,
        preset=PresetMode.STANDARD,
    )

    # Check zip contents
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        filenames = z.namelist()
        # Favicons
        assert "favicon.ico" in filenames
        assert "favicon-16x16.png" in filenames
        assert "favicon-32x32.png" in filenames
        assert "favicon-48x48.png" in filenames
        assert "favicon-96x96.png" in filenames
        assert "favicon-128.png" in filenames
        assert "favicon-196x196.png" in filenames
        # Apple iOS (Modern + Legacy)
        assert "apple-touch-icon.png" in filenames
        assert "apple-touch-icon-precomposed.png" in filenames
        assert "apple-touch-icon-57x57.png" in filenames
        assert "apple-touch-icon-60x60.png" in filenames
        assert "apple-touch-icon-72x72.png" in filenames
        assert "apple-touch-icon-76x76.png" in filenames
        assert "apple-touch-icon-114x114.png" in filenames
        assert "apple-touch-icon-120x120.png" in filenames
        assert "apple-touch-icon-144x144.png" in filenames
        assert "apple-touch-icon-152x152.png" in filenames
        # Android / PWA
        assert "android-chrome-192x192.png" in filenames
        assert "android-chrome-512x512.png" in filenames
        # Windows tiles
        assert "mstile-70x70.png" in filenames
        assert "mstile-144x144.png" in filenames
        assert "mstile-150x150.png" in filenames
        assert "mstile-310x150.png" in filenames
        assert "mstile-310x310.png" in filenames
        assert "browserconfig.xml" in filenames
        # Social
        assert "og-image.png" in filenames
        assert "twitter-image.png" in filenames
        # Manifest & Multi-Framework Snippets
        assert "site.webmanifest" in filenames
        assert "safari-pinned-tab.svg" in filenames
        assert "snippet-html.txt" in filenames
        assert "snippet-nextjs.txt" in filenames
        assert "snippet-vite.txt" in filenames
        assert "code.txt" in filenames
        assert "head-tags.html" in filenames
        assert "README.md" in filenames



def test_generate_favicons_minimal_preset():
    square_bytes = create_test_image(256, 256)
    meta = FaviconMetadata(app_name="Mini")

    zip_bytes = generate_favicons(
        square_image_bytes=square_bytes,
        horizontal_image_bytes=None,
        metadata=meta,
        preset=PresetMode.MINIMAL,
    )

    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        filenames = z.namelist()
        assert "favicon.ico" in filenames
        assert "apple-touch-icon.png" in filenames
        assert "favicon-32x32.png" in filenames
        assert "favicon-16x16.png" in filenames
        assert "head-tags.html" in filenames
        # Should not have large social cards in minimal
        assert "og-image.png" not in filenames
        assert "browserconfig.xml" not in filenames
