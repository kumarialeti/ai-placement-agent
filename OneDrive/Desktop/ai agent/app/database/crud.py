"""
CRUD operations for database models.
"""

import json
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import (
    ChatMessage,
    Document,
    InterviewAnswer,
    InterviewSession,
    Resume,
    User,
    UserProfile,
)


# ─── User CRUD ───


async def create_user(db: AsyncSession, email: str, username: str, hashed_password: str, full_name: str | None = None) -> User:
    user = User(email=email, username=username, hashed_password=hashed_password, full_name=full_name)
    db.add(user)
    await db.flush()
    # Create empty profile
    profile = UserProfile(user_id=user.id)
    db.add(profile)
    await db.flush()
    return user


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


# ─── Resume CRUD ───


async def create_resume(db: AsyncSession, user_id: int, filename: str, file_path: str, raw_text: str = "") -> Resume:
    resume = Resume(user_id=user_id, filename=filename, file_path=file_path, raw_text=raw_text)
    db.add(resume)
    await db.flush()
    return resume


async def update_resume_analysis(
    db: AsyncSession,
    resume_id: int,
    skills: list[str],
    strengths: list[str],
    weaknesses: list[str],
    ats_score: float,
    analysis_result: dict,
) -> Resume:
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one()
    resume.skills = json.dumps(skills)
    resume.strengths = json.dumps(strengths)
    resume.weaknesses = json.dumps(weaknesses)
    resume.ats_score = ats_score
    resume.analysis_result = json.dumps(analysis_result)
    await db.flush()
    return resume


async def get_user_resumes(db: AsyncSession, user_id: int) -> list[Resume]:
    result = await db.execute(
        select(Resume).where(Resume.user_id == user_id).order_by(Resume.created_at.desc())
    )
    return list(result.scalars().all())


async def get_latest_resume(db: AsyncSession, user_id: int) -> Resume | None:
    result = await db.execute(
        select(Resume).where(Resume.user_id == user_id).order_by(Resume.created_at.desc()).limit(1)
    )
    return result.scalar_one_or_none()


# ─── Interview CRUD ───


async def create_interview_session(
    db: AsyncSession, user_id: int, topic: str, difficulty: str, total_questions: int
) -> InterviewSession:
    session = InterviewSession(
        user_id=user_id, topic=topic, difficulty=difficulty, total_questions=total_questions
    )
    db.add(session)
    await db.flush()
    return session


async def add_interview_answer(
    db: AsyncSession,
    session_id: int,
    question: str,
    user_answer: str,
    ideal_answer: str,
    score: float,
    feedback: str,
) -> InterviewAnswer:
    answer = InterviewAnswer(
        session_id=session_id,
        question=question,
        user_answer=user_answer,
        ideal_answer=ideal_answer,
        score=score,
        feedback=feedback,
    )
    db.add(answer)
    await db.flush()
    return answer


async def complete_interview_session(db: AsyncSession, session_id: int, score: float, feedback: dict):
    result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
    session = result.scalar_one()
    session.score = score
    session.feedback = json.dumps(feedback)
    session.status = "completed"
    session.completed_at = datetime.utcnow()
    await db.flush()
    return session


async def get_user_sessions(db: AsyncSession, user_id: int) -> list[InterviewSession]:
    result = await db.execute(
        select(InterviewSession)
        .where(InterviewSession.user_id == user_id)
        .order_by(InterviewSession.created_at.desc())
    )
    return list(result.scalars().all())


# ─── Chat CRUD ───


async def save_chat_message(
    db: AsyncSession, user_id: int, role: str, content: str, intent: str | None = None
) -> ChatMessage:
    msg = ChatMessage(user_id=user_id, role=role, content=content, intent=intent)
    db.add(msg)
    await db.flush()
    return msg


async def get_chat_history(db: AsyncSession, user_id: int, limit: int = 20) -> list[ChatMessage]:
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
    )
    return list(reversed(result.scalars().all()))


# ─── Profile CRUD ───


async def get_user_profile(db: AsyncSession, user_id: int) -> UserProfile | None:
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
    return result.scalar_one_or_none()


async def update_user_profile(db: AsyncSession, user_id: int, **kwargs) -> UserProfile:
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = UserProfile(user_id=user_id)
        db.add(profile)
    for key, value in kwargs.items():
        if isinstance(value, (list, dict)):
            setattr(profile, key, json.dumps(value))
        else:
            setattr(profile, key, value)
    profile.last_active = datetime.utcnow()
    await db.flush()
    return profile


# ─── Document CRUD ───


async def create_document(
    db: AsyncSession, filename: str, file_path: str, category: str, chunk_count: int
) -> Document:
    doc = Document(
        filename=filename, file_path=file_path, category=category, chunk_count=chunk_count
    )
    db.add(doc)
    await db.flush()
    return doc


async def get_documents_by_category(db: AsyncSession, category: str) -> list[Document]:
    result = await db.execute(select(Document).where(Document.category == category))
    return list(result.scalars().all())
