"""
Recruiter API routes — view candidate interview submissions, scores, and transcripts.
"""

import json
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware import get_current_user
from app.database.connection import get_db
from app.database.models import User, InterviewSession, InterviewAnswer, Resume

router = APIRouter(prefix="/recruiter", tags=["Recruiter"])


@router.get("/sessions")
async def get_all_candidate_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all mock interview sessions across all candidates for the Recruiter Dashboard.
    For simplicity, in this sandbox environment, any authenticated user can access this recruiter view.
    """
    # Eagerly load user, user resumes, and all answers for each session
    stmt = (
        select(InterviewSession)
        .options(
            selectinload(InterviewSession.user).selectinload(User.resumes),
            selectinload(InterviewSession.answers),
        )
        .order_by(InterviewSession.created_at.desc())
    )

    result = await db.execute(stmt)
    sessions = result.scalars().all()

    response_data = []
    for s in sessions:
        user_resumes = s.user.resumes if s.user else []
        latest_resume = user_resumes[0].filename if user_resumes else "No resume uploaded"

        answers_list = []
        for ans in s.answers:
            # Attempt to parse detailed metrics from feedback JSON string
            metrics = {
                "technical_knowledge": 0.0,
                "communication": 0.0,
                "confidence": 0.0,
                "relevance": 0.0,
                "feedback_text": ans.feedback or "",
                "improvement_tips": [],
                "ideal_answer": ans.ideal_answer or "",
            }

            if ans.feedback:
                try:
                    parsed = json.loads(ans.feedback)
                    if isinstance(parsed, dict):
                        metrics["technical_knowledge"] = parsed.get("technical_knowledge", 0.0)
                        metrics["communication"] = parsed.get("communication", 0.0)
                        metrics["confidence"] = parsed.get("confidence", 0.0)
                        metrics["relevance"] = parsed.get("relevance", 0.0)
                        metrics["feedback_text"] = parsed.get("feedback_text", ans.feedback)
                        metrics["improvement_tips"] = parsed.get("improvement_tips", [])
                        metrics["ideal_answer"] = parsed.get("ideal_answer", ans.ideal_answer or "")
                except json.JSONDecodeError:
                    pass

            answers_list.append({
                "id": ans.id,
                "question": ans.question,
                "user_answer": ans.user_answer,
                "score": ans.score,
                "metrics": metrics,
                "created_at": ans.created_at.isoformat() if ans.created_at else None,
            })

        # Calculate averages for this session if there are answers
        avg_tech = sum(a["metrics"]["technical_knowledge"] for a in answers_list) / max(len(answers_list), 1)
        avg_comm = sum(a["metrics"]["communication"] for a in answers_list) / max(len(answers_list), 1)
        avg_conf = sum(a["metrics"]["confidence"] for a in answers_list) / max(len(answers_list), 1)
        avg_rel = sum(a["metrics"]["relevance"] for a in answers_list) / max(len(answers_list), 1)

        response_data.append({
            "session_id": s.id,
            "topic": s.topic,
            "difficulty": s.difficulty,
            "status": s.status,
            "overall_score": s.score,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
            "candidate": {
                "id": s.user.id if s.user else None,
                "username": s.user.username if s.user else "Unknown",
                "full_name": s.user.full_name if s.user else "Unknown Candidate",
                "email": s.user.email if s.user else "N/A",
                "latest_resume": latest_resume,
            },
            "averages": {
                "technical_knowledge": round(avg_tech, 2),
                "communication": round(avg_comm, 2),
                "confidence": round(avg_conf, 2),
                "relevance": round(avg_rel, 2),
            },
            "answers": answers_list,
        })

    return response_data
