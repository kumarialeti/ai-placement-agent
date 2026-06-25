"""
Resume API routes — upload, analyze, get results.
"""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware import get_current_user
from app.database.connection import get_db
from app.database.crud import get_user_resumes
from app.database.models import User
from app.services.resume_service import upload_and_analyze_resume
from app.utils.config import get_settings

router = APIRouter(prefix="/resume", tags=["Resume"])
settings = get_settings()


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload and analyze a resume PDF."""
    # Validate file
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File size exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    result = await upload_and_analyze_resume(db, current_user.id, content, file.filename)
    return result


@router.get("/list")
async def list_resumes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all uploaded resumes."""
    resumes = await get_user_resumes(db, current_user.id)
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "ats_score": r.ats_score,
            "created_at": r.created_at.isoformat(),
        }
        for r in resumes
    ]
