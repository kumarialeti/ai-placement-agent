import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000"

# 1. Register a dummy user
email = "test_groq_user@example.com"
password = "password123"

print("Registering user...")
res = requests.post(f"{BASE_URL}/api/v1/auth/register", json={
    "username": email,
    "email": email,
    "password": password,
    "full_name": "Test User"
})
if res.status_code == 400 and "already registered" in res.text:
    print("User already exists, proceeding to login.")
else:
    print("Register Response:", res.status_code, res.text)

# 2. Login
print("Logging in...")
res = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
    "email": email,
    "password": password
})
print("Login Response:", res.status_code, res.text)
token = res.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# 3. Create a dummy PDF
print("Creating dummy PDF...")
pdf_path = "dummy_resume.pdf"
with open(pdf_path, "wb") as f:
    f.write(b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj\n4 0 obj\n<< /Length 53 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Python, React, Machine Learning, Data Science) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000288 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n390\n%%EOF")

# 4. Upload resume
print("Uploading resume...")
with open(pdf_path, "rb") as f:
    res = requests.post(
        f"{BASE_URL}/api/v1/resume/upload",
        headers=headers,
        files={"file": ("dummy_resume.pdf", f, "application/pdf")}
    )
    
print("Upload Response:", res.status_code)
print(json.dumps(res.json(), indent=2))

if os.path.exists(pdf_path):
    os.remove(pdf_path)
