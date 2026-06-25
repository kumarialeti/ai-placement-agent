"""
Event tracking for analytics.
"""

from datetime import datetime
from collections import defaultdict

from app.utils.logger import get_logger

logger = get_logger(__name__)

# In-memory event store (per user)
_events: dict[int, list[dict]] = defaultdict(list)


def track_event(user_id: int, event_type: str, data: dict | None = None):
    """Track an analytics event."""
    event = {
        "type": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "data": data or {},
    }
    _events[user_id].append(event)
    logger.debug(f"Tracked event: {event_type} for user {user_id}")


def get_events(user_id: int, event_type: str | None = None) -> list[dict]:
    """Get events for a user, optionally filtered by type."""
    events = _events.get(user_id, [])
    if event_type:
        events = [e for e in events if e["type"] == event_type]
    return events


# ─── Convenience Event Trackers ───

def track_question_asked(user_id: int, topic: str, difficulty: str):
    track_event(user_id, "question_asked", {"topic": topic, "difficulty": difficulty})


def track_answer_evaluated(user_id: int, topic: str, score: float):
    track_event(user_id, "answer_evaluated", {"topic": topic, "score": score})


def track_resume_uploaded(user_id: int, ats_score: float):
    track_event(user_id, "resume_uploaded", {"ats_score": ats_score})


def track_rag_search(user_id: int, query: str):
    track_event(user_id, "rag_search", {"query": query[:100]})


def track_roadmap_generated(user_id: int, target_role: str):
    track_event(user_id, "roadmap_generated", {"target_role": target_role})
