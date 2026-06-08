"""
Unified memory manager combining short-term and long-term memory.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.memory.long_term import get_user_context, record_interview_score, update_skills, update_weak_areas
from app.memory.short_term import add_message, clear_session, get_formatted_history, get_history
from app.utils.logger import get_logger

logger = get_logger(__name__)


class MemoryManager:
    """Unified interface for short-term and long-term memory."""

    def __init__(self, user_id: int, session_id: str):
        self.user_id = user_id
        self.session_id = session_id

    # ─── Short-term ───

    def add_user_message(self, content: str):
        add_message(self.session_id, "user", content)

    def add_assistant_message(self, content: str, metadata: dict | None = None):
        add_message(self.session_id, "assistant", content, metadata)

    def get_chat_history(self, limit: int = 10) -> list[dict]:
        return get_history(self.session_id, limit)

    def get_formatted_chat_history(self, limit: int = 10) -> str:
        return get_formatted_history(self.session_id, limit)

    def clear(self):
        clear_session(self.session_id)

    # ─── Long-term (async) ───

    async def get_user_profile(self, db: AsyncSession) -> dict:
        return await get_user_context(db, self.user_id)

    async def update_user_skills(self, db: AsyncSession, skills: list[str]):
        await update_skills(db, self.user_id, skills)

    async def update_user_weak_areas(self, db: AsyncSession, weak_areas: list[str]):
        await update_weak_areas(db, self.user_id, weak_areas)

    async def record_score(self, db: AsyncSession, score: float):
        await record_interview_score(db, self.user_id, score)
