"""
Event tracking for analytics.
"""

import json
from datetime import datetime

from app.database.connection import async_session_factory
from app.database.models import AnalyticsEvent
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def track_event(user_id: int, event_type: str, data: dict | None = None):
    """Track an analytics event."""
    async with async_session_factory() as session:
        event = AnalyticsEvent(
            user_id=user_id,
            event_type=event_type,
            event_data=json.dumps(data or {}),
            created_at=datetime.utcnow(),
        )
        session.add(event)
        try:
            await session.commit()
            logger.debug(f"Tracked event: {event_type} for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to track event: {e}")
            await session.rollback()


async def get_events(user_id: int, event_type: str | None = None) -> list[dict]:
    """Get events for a user, optionally filtered by type."""
    from sqlalchemy import select

    async with async_session_factory() as session:
        stmt = select(AnalyticsEvent).where(AnalyticsEvent.user_id == user_id)
        if event_type:
            stmt = stmt.where(AnalyticsEvent.event_type == event_type)
        
        result = await session.execute(stmt)
        records = result.scalars().all()
        
        return [
            {
                "type": r.event_type,
                "timestamp": r.created_at.isoformat(),
                "data": json.loads(r.event_data) if r.event_data else {},
            }
            for r in records
        ]


# ─── Convenience Event Trackers ───

async def track_question_asked(user_id: int, topic: str, difficulty: str):
    await track_event(user_id, "question_asked", {"topic": topic, "difficulty": difficulty})


async def track_answer_evaluated(user_id: int, topic: str, score: float):
    await track_event(user_id, "answer_evaluated", {"topic": topic, "score": score})


async def track_resume_uploaded(user_id: int, ats_score: float):
    await track_event(user_id, "resume_uploaded", {"ats_score": ats_score})


async def track_rag_search(user_id: int, query: str):
    await track_event(user_id, "rag_search", {"query": query[:100]})


async def track_roadmap_generated(user_id: int, target_role: str):
    await track_event(user_id, "roadmap_generated", {"target_role": target_role})
