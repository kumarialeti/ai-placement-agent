"""Quick API test script."""
import httpx
import json

BASE = "http://127.0.0.1:8000/api/v1"

print("=" * 50)
print("AI Placement Agent — API Tests")
print("=" * 50)

# 1. Health Check
print("\n[1] HEALTH CHECK")
r = httpx.get("http://127.0.0.1:8000/health")
print(f"    Status: {r.status_code} | {r.json()}")
assert r.status_code == 200

# 2. Root
print("\n[2] ROOT ENDPOINT")
r = httpx.get("http://127.0.0.1:8000/")
print(f"    Status: {r.status_code} | {r.json()}")
assert r.status_code == 200

# 3. Register
print("\n[3] REGISTER USER")
r = httpx.post(f"{BASE}/auth/register", json={
    "email": "student@test.com",
    "username": "student1",
    "password": "test123456",
    "full_name": "Test Student"
})
print(f"    Status: {r.status_code}")
if r.status_code == 201:
    data = r.json()
    token = data["access_token"]
    user = data["user"]
    print(f"    User: {user['username']} ({user['email']})")
    print(f"    Token: {token[:40]}...")
elif r.status_code == 400:
    print("    Already registered — logging in...")
    r = httpx.post(f"{BASE}/auth/login", json={
        "email": "student@test.com",
        "password": "test123456"
    })
    data = r.json()
    token = data["access_token"]
    print(f"    Login Status: {r.status_code}")

headers = {"Authorization": f"Bearer {token}"}

# 4. Get Profile
print("\n[4] GET PROFILE")
r = httpx.get(f"{BASE}/auth/me", headers=headers)
print(f"    Status: {r.status_code}")
profile = r.json()
print(f"    Name: {profile.get('full_name', 'N/A')}")
print(f"    Email: {profile.get('email', 'N/A')}")
assert r.status_code == 200

# 5. Chat History
print("\n[5] CHAT HISTORY (should be empty)")
r = httpx.get(f"{BASE}/chat/history", headers=headers)
print(f"    Status: {r.status_code} | Messages: {len(r.json())}")
assert r.status_code == 200

# 6. Resume List
print("\n[6] RESUME LIST (should be empty)")
r = httpx.get(f"{BASE}/resume/list", headers=headers)
print(f"    Status: {r.status_code} | Resumes: {len(r.json())}")
assert r.status_code == 200

# 7. Interview History
print("\n[7] INTERVIEW HISTORY (should be empty)")
r = httpx.get(f"{BASE}/interview/history", headers=headers)
print(f"    Status: {r.status_code} | Sessions: {len(r.json())}")
assert r.status_code == 200

# 8. Progress Report
print("\n[8] PROGRESS REPORT")
r = httpx.get(f"{BASE}/roadmap/progress", headers=headers)
print(f"    Status: {r.status_code}")
assert r.status_code == 200

# 9. Auth Protection — no token
print("\n[9] AUTH PROTECTION (no token)")
r = httpx.get(f"{BASE}/auth/me")
print(f"    Status: {r.status_code} (expected 403)")
assert r.status_code == 403

# 10. Duplicate Registration
print("\n[10] DUPLICATE REGISTRATION")
r = httpx.post(f"{BASE}/auth/register", json={
    "email": "student@test.com",
    "username": "dup",
    "password": "test123456"
})
print(f"    Status: {r.status_code} (expected 400)")
assert r.status_code == 400

# 11. Wrong Password
print("\n[11] WRONG PASSWORD LOGIN")
r = httpx.post(f"{BASE}/auth/login", json={
    "email": "student@test.com",
    "password": "wrongpassword"
})
print(f"    Status: {r.status_code} (expected 401)")
assert r.status_code == 401

print("\n" + "=" * 50)
print("✅ ALL 11 API TESTS PASSED!")
print("=" * 50)
