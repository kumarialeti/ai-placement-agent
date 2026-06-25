"""
Analytics API routes to expose user metrics.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.metrics import get_user_metrics
from app.auth.middleware import get_current_user
from app.database.connection import get_db
from app.database.models import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/metrics")
async def get_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get aggregate analytics metrics for the current user."""
    metrics = await get_user_metrics(current_user.id)
    return metrics
