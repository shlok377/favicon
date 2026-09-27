"""Integration test verifying frontend-to-backend contract and health endpoint."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_check_contract():
    """Verify that /api/health responds with the exact contract required by Vite proxy."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "favicon-generator-api"
        assert data["port"] == 1947


@pytest.mark.asyncio
async def test_cors_headers_for_frontend():
    """Verify CORS headers allow cross-origin requests from frontend on port 3737."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        headers = {
            "Origin": "http://localhost:3737",
            "Access-Control-Request-Method": "POST",
        }
        response = await client.options("/api/health", headers=headers)
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
