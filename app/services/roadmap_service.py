"""
Roadmap service — study plan generation and tracking.
"""

from app.analytics.tracker import track_roadmap_generated
from app.tools.roadmap_tool import generate_roadmap
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def create_roadmap(
    user_id: int,
    target_role: str,
    duration_weeks: int = 4,
    weak_areas: list[str] | None = None,
) -> dict:
    """Generate a personalized study roadmap."""
    areas = ", ".join(weak_areas) if weak_areas else "general"

    # Directly call the tool (no .invoke)
    result = generate_roadmap(
        target_role=target_role,
        duration_weeks=duration_weeks,
        weak_areas=areas,
    )

    track_roadmap_generated(user_id, target_role)

    logger.info(f"Generated {duration_weeks}-week roadmap for {target_role}")
    return result
