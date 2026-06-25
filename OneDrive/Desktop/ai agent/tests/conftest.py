"""
Shared test fixtures and configuration.
"""

import asyncio
import os
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

# Set test environment
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_data/test.db"
os.environ["OPENAI_API_KEY"] = "sk-test-key"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"
os.environ["CHROMA_PERSIST_DIR"] = "./test_data/chroma"
os.environ["UPLOAD_DIR"] = "./test_data/uploads"
os.environ["DEBUG"] = "false"

# Create test directories
os.makedirs("./test_data", exist_ok=True)
os.makedirs("./test_data/uploads", exist_ok=True)


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def test_app():
    """Create a test FastAPI application."""
    from app.database.connection import engine, init_db
    from app.database.models import Base
    from app.main import app

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield app

    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client(test_app):
    """Create an async test client."""
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def auth_client(client):
    """Create an authenticated test client."""
    # Register a test user
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpass123",
            "full_name": "Test User",
        },
    )
    data = response.json()
    token = data["access_token"]

    # Add auth header
    client.headers["Authorization"] = f"Bearer {token}"
    yield client
