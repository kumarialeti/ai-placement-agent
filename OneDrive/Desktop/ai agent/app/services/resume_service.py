"""
Resume service — upload, parse, store, and analyze resumes.
"""

import os
import uuid

import aiofiles
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.crud import create_resume, update_resume_analysis
from app.rag.loader import load_pdf
from app.tools.resume_parser_tool import parse_resume
from app.utils.config import get_settings
from app.utils.helpers import ensure_directory
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


async def upload_and_analyze_resume(
    db: AsyncSession,
    user_id: int,
    file_content: bytes,
    filename: str,
) -> dict:
    """Upload a resume PDF, extract text, and run analysis."""

    # Save file
    upload_dir = os.path.join(settings.UPLOAD_DIR, "resumes")
    ensure_directory(upload_dir)

    unique_name = f"{uuid.uuid4().hex}_{filename}"
    file_path = os.path.join(upload_dir, unique_name)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_content)

    logger.info(f"Resume saved: {file_path}")

    # Extract text
    raw_text = load_pdf(file_path)

    # Save to DB
    resume = await create_resume(db, user_id, filename, file_path, raw_text)

    # Analyze
    analysis = parse_resume.invoke({"resume_text": raw_text})

    # Update DB with analysis
    await update_resume_analysis(
        db,
        resume.id,
        skills=analysis["skills"],
        strengths=analysis["strengths"],
        weaknesses=analysis["weaknesses"],
        ats_score=analysis["ats_score"],
        analysis_result=analysis,
    )

    logger.info(f"Resume analyzed — ATS Score: {analysis['ats_score']}")

    return {
        "resume_id": resume.id,
        "filename": filename,
        "ats_score": analysis["ats_score"],
        "analysis": analysis,
    }


async def get_resume_text(db: AsyncSession, user_id: int) -> str:
    """Get the latest resume text for a user."""
    from app.database.crud import get_latest_resume
    resume = await get_latest_resume(db, user_id)
    return resume.raw_text if resume else ""
