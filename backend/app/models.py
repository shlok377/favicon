"""Data models for favicon generation."""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class PresetMode(str, Enum):
    STANDARD = "standard"
    MINIMAL = "minimal"
    CUSTOM = "custom"


class CategorySelection(BaseModel):
    standard_favicons: bool = True
    apple_ios: bool = True
    android_pwa: bool = True
    windows_tiles: bool = True
    social_cards: bool = True


class FaviconMetadata(BaseModel):
    app_name: str = Field(default="My Web App", description="Full name of the web application")
    short_name: str = Field(default="App", description="Short name for home screens")
    theme_color: str = Field(default="#2563eb", description="Hex theme color")
    background_color: str = Field(default="#ffffff", description="Hex background color")
    site_url: str = Field(default="https://example.com", description="Production site URL")
    description: str = Field(
        default="Modern web application with full favicon & social share asset support.",
        description="Site description for OpenGraph & Twitter cards",
    )


class GenerateRequest(BaseModel):
    metadata: FaviconMetadata = Field(default_factory=FaviconMetadata)
    preset: PresetMode = PresetMode.STANDARD
    custom_categories: Optional[CategorySelection] = None
