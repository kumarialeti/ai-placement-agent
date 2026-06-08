"""
Long-term memory — persistent user profile and learning history.
"""

import json

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.crud import get_user_profile, update_user_profile
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def get_user_context(db: AsyncSession, user_id: int) -> dict:
    """Get the user's long-term context for personalization."""
    profile = await get_user_profile(db, user_id)
    if not profile:
        return {
            "known_skills": [],
            "weak_areas": [],
            "strong_areas": [],
            "target_role": None,
            "experience_level": None,
            "total_mock_interviews": 0,
            "average_score": 0.0,
        }

    return {
        "known_skills": json.loads(profile.known_skills) if profile.known_skills else [],
        "weak_areas": json.loads(profile.weak_areas) if profile.weak_areas else [],
        "strong_areas": json.loads(profile.strong_areas) if profile.strong_areas else [],
        "target_role": profile.target_role,
        "experience_level": profile.experience_level,
        "total_mock_interviews": profile.total_mock_interviews,
        "average_score": profile.average_score,
    }


async def update_skills(db: AsyncSession, user_id: int, new_skills: list[str]):
    """Update the user's known skills."""
    profile = await get_user_profile(db, user_id)
    existing = json.loads(profile.known_skills) if profile and profile.known_skills else []
    merged = list(set(existing + new_skills))
    await update_user_profile(db, user_id, known_skills=merged)
    logger.info(f"Updated skills for user {user_id}: {len(merged)} total")


async def update_weak_areas(db: AsyncSession, user_id: int, weak_areas: list[str]):
    """Update the user's weak areas."""
    await update_user_profile(db, user_id, weak_areas=weak_areas)
    logger.info(f"Updated weak areas for user {user_id}: {weak_areas}")


async def record_interview_score(db: AsyncSession, user_id: int, score: float):
    """Record an interview score and update averages."""
    profile = await get_user_profile(db, user_id)
    total = (profile.total_mock_interviews or 0) if profile else 0
    avg = (profile.average_score or 0.0) if profile else 0.0

    new_total = total + 1
    new_avg = ((avg * total) + score) / new_total

    await update_user_profile(
        db, user_id,
        total_mock_interviews=new_total,
        average_score=round(new_avg, 2),
    )
    logger.info(f"User {user_id}: Interview #{new_total}, Avg score: {new_avg:.2f}")
