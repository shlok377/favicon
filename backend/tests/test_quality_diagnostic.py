"""Quality diagnostic harness to reproduce and measure downscaling fidelity."""

import io
import math
from PIL import Image, ImageDraw, ImageFilter, ImageStat
from app.generator import generate_ico, generate_png, load_image, resize_image


def create_detailed_test_icon(size: int = 512) -> bytes:
    """Create a high-detail icon with fine lines, circle, text, and transparency."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Outer circle
    draw.ellipse([32, 32, size - 32, size - 32], fill=(37, 99, 235, 255), outline=(29, 78, 216, 255), width=8)
    
    # Inner geometric shapes (sharp contrast edges)
    draw.rectangle([128, 128, size - 128, size - 128], fill=(255, 255, 255, 255))
    draw.polygon([(size // 2, 140), (160, size - 160), (size - 160, size - 160)], fill=(239, 68, 68, 255))
    
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def measure_edge_contrast_and_sharpness(image: Image.Image) -> float:
    """
    Measure Laplacian variance / high-frequency energy as a proxy for visual sharpness.
    Higher value = crisper edges; lower value = blurry / muddy image.
    """
    # Convert to grayscale luminance
    gray = image.convert("L")
    # Apply Laplacian kernel to find edges
    edges = gray.filter(ImageFilter.Kernel((3, 3), [0, 1, 0, 1, -4, 1, 0, 1, 0], scale=1, offset=128))
    stat = ImageStat.Stat(edges)
    # Variance of the edges
    return stat.var[0]


def test_ico_frame_generation_quality():
    """Verify each ICO frame is sharp and generated with optimal quality."""
    master_bytes = create_detailed_test_icon(512)
    ico_bytes = generate_ico(master_bytes)
    
    ico = Image.open(io.BytesIO(ico_bytes))
    frame_sizes = list(ico.info.get("sizes", set()))
    print(f"ICO extracted frame sizes: {frame_sizes}")
    
    # Check that 16x16, 32x32, 48x48 frames exist
    assert (16, 16) in frame_sizes
    assert (32, 32) in frame_sizes
    assert (48, 48) in frame_sizes
    
    # Check sharpness of 16x16 frame
    frame_16 = ico.ico.getimage((16, 16))
    sharpness_16 = measure_edge_contrast_and_sharpness(frame_16)
    print(f"16x16 sharpness score: {sharpness_16:.2f}")
    assert sharpness_16 > 50.0  # Sharpness threshold

