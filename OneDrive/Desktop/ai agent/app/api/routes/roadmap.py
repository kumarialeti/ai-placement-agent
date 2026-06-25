"""
Roadmap API routes — generate study plans, get progress.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.reports import generate_progress_report
from app.auth.middleware import get_current_user
from app.database.connection import get_db
from app.database.models import User
from app.database.schemas import RoadmapRequest
from app.services.roadmap_service import create_roadmap

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])


@router.post("/generate")
async def generate_study_roadmap(
    request: RoadmapRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a personalized study roadmap."""
    result = await create_roadmap(
        user_id=current_user.id,
        target_role=request.target_role,
        duration_weeks=request.duration_weeks,
        weak_areas=request.weak_areas,
    )
    return result


@router.get("/progress")
async def get_progress(
    current_user: User = Depends(get_current_user),
):
    """Get user progress report."""
    report = generate_progress_report(current_user.id)
    return {"report": report}
