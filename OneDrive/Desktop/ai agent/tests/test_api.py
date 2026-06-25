"""
API endpoint tests.
"""

import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    """Test health endpoint."""
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_root(client):
    """Test root endpoint."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "running"
    assert "version" in data


@pytest.mark.asyncio
async def test_register_user(client):
    """Test user registration."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "new@example.com",
            "username": "newuser",
            "password": "password123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "new@example.com"


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    """Test duplicate email registration."""
    user_data = {
        "email": "dup@example.com",
        "username": "user1",
        "password": "password123",
    }
    await client.post("/api/v1/auth/register", json=user_data)

    user_data["username"] = "user2"
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login(client):
    """Test user login."""
    # Register first
    await client.post(
        "/api/v1/auth/register",
        json={"email": "login@example.com", "username": "loginuser", "password": "pass123"},
    )

    # Login
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "pass123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    """Test login with wrong password."""
    await client.post(
        "/api/v1/auth/register",
        json={"email": "wrong@example.com", "username": "wronguser", "password": "pass123"},
    )

    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "wrong@example.com", "password": "wrongpass"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_protected_route_no_auth(client):
    """Test accessing protected route without auth."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_profile(auth_client):
    """Test getting user profile with auth."""
    response = await auth_client.get("/api/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_chat_history_empty(auth_client):
    """Test getting empty chat history."""
    response = await auth_client.get("/api/v1/chat/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_interview_history_empty(auth_client):
    """Test getting empty interview history."""
    response = await auth_client.get("/api/v1/interview/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
