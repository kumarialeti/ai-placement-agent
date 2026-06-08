"""
Interview API routes — start mock interview, submit answers, get evaluation.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware import get_current_user
from app.database.connection import get_db
from app.database.models import User
from app.database.schemas import AnswerSubmitRequest, InterviewStartRequest
from app.services.interview_service import (
    complete_session,
    get_history,
    start_mock_interview,
    submit_answer,
)

router = APIRouter(prefix="/interview", tags=["Interview"])


@router.post("/start")
async def start_interview(
    request: InterviewStartRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start a new mock interview session."""
    result = await start_mock_interview(
        db,
        user_id=current_user.id,
        topic=request.topic,
        difficulty=request.difficulty,
        num_questions=request.num_questions,
    )
    return result


@router.post("/answer")
async def submit_interview_answer(
    request: AnswerSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit an answer for evaluation."""
    result = await submit_answer(
        db,
        user_id=current_user.id,
        session_id=request.session_id,
        question_id=request.question_id,
        user_answer=request.answer,
    )
    return result


@router.post("/complete/{session_id}")
async def complete_interview(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Complete a mock interview session and get final score."""
    result = await complete_session(db, session_id, current_user.id)
    return result


@router.get("/history")
async def interview_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get interview session history."""
    return await get_history(db, current_user.id)
