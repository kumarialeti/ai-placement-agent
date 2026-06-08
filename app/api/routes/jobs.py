"""
Job description API routes — upload JD, match against resume.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware import get_current_user
from app.database.connection import get_db
from app.database.models import User
from app.database.schemas import JDMatchRequest, JDMatchResponse, CoverLetterRequest, CoverLetterResponse
from app.services.resume_service import get_resume_text
from app.tools.jd_match_tool import match_job_description
from app.tools.cover_letter_tool import generate_cover_letter

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/match", response_model=JDMatchResponse)
async def match_jd(
    request: JDMatchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Match resume against a job description."""
    resume_text = await get_resume_text(db, current_user.id)
    if not resume_text:
        return JDMatchResponse(
            match_score=0,
            summary="Please upload your resume first before matching against a job description.",
        )

    result = match_job_description.invoke({
        "resume_text": resume_text,
        "job_description": request.job_description,
    })

    return JDMatchResponse(**result)


@router.post("/cover-letter", response_model=CoverLetterResponse)
async def create_cover_letter(
    request: CoverLetterRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a tailored cover letter based on user's resume and a JD."""
    resume_text = await get_resume_text(db, current_user.id)
    if not resume_text:
        return CoverLetterResponse(
            cover_letter="Please upload your resume first before generating a cover letter."
        )

    result = generate_cover_letter.invoke({
        "resume_text": resume_text,
        "job_description": request.job_description,
        "company_name": request.company_name,
        "job_title": request.job_title
    })

    return CoverLetterResponse(cover_letter=result)
