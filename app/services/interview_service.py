"""
Interview service — mock interview session management.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.tracker import track_answer_evaluated, track_question_asked
from app.database.crud import (
    add_interview_answer,
    complete_interview_session,
    create_interview_session,
    get_user_sessions,
)
from app.evaluation.answer_evaluator import evaluate_answer
from app.evaluation.feedback_generator import format_feedback_markdown, generate_feedback
from app.tools.interview_tool import generate_interview_questions
from app.utils.logger import get_logger

logger = get_logger(__name__)

# In-memory question cache per session
_session_questions: dict[int, list[dict]] = {}


async def start_mock_interview(
    db: AsyncSession,
    user_id: int,
    topic: str,
    difficulty: str = "intermediate",
    num_questions: int = 5,
) -> dict:
    """Start a new mock interview session and generate the first question."""
    logger.info(f"Starting mock interview — Topic: {topic}, Difficulty: {difficulty}")

    # Fetch user's latest resume
    from app.database.crud import get_latest_resume
    from app.rag.loader import load_pdf
    
    resume_text = "No resume provided."
    latest_resume = await get_latest_resume(db, user_id)
    if latest_resume:
        import os
        from app.utils.config import get_settings
        settings = get_settings()
        file_path = os.path.join(settings.UPLOAD_DIR, latest_resume.filename)
        if os.path.exists(file_path):
            resume_text = load_pdf(file_path)

    # Generate ONLY the first question
    result = generate_interview_questions.invoke({
        "topic": topic,
        "resume_text": resume_text[:3000],  # Limit to 3000 chars to save tokens
        "difficulty": difficulty,
        "num_questions": 1,
    })
    questions = result["questions"]

    # Create session in DB (total_questions is dynamic now, but we can set a placeholder or None if DB allows, default 5)
    session = await create_interview_session(db, user_id, topic, difficulty, num_questions)

    # Cache questions
    _session_questions[session.id] = questions

    # Track
    track_question_asked(user_id, topic, difficulty)

    return {
        "session_id": session.id,
        "topic": topic,
        "difficulty": difficulty,
        "total_questions": num_questions,
        "questions": [
            {"question_id": i, "question": q["question"], "difficulty": q["difficulty"]}
            for i, q in enumerate(questions)
        ],
    }


async def submit_answer(
    db: AsyncSession,
    user_id: int,
    session_id: int,
    question_id: int,
    user_answer: str,
) -> dict:
    """Submit and evaluate an answer for a mock interview question, and generate the next."""
    questions = _session_questions.get(session_id, [])
    if question_id >= len(questions):
        return {"error": "Invalid question ID"}

    question_data = questions[question_id]
    question_text = question_data["question"]

    # Fetch user's latest resume to tailor the next question
    from app.database.crud import get_latest_resume
    from app.rag.loader import load_pdf
    
    resume_text = "No resume provided."
    latest_resume = await get_latest_resume(db, user_id)
    if latest_resume:
        import os
        from app.utils.config import get_settings
        settings = get_settings()
        file_path = os.path.join(settings.UPLOAD_DIR, latest_resume.filename)
        if os.path.exists(file_path):
            resume_text = load_pdf(file_path)

    # Evaluate and dynamically generate the next question
    evaluation = evaluate_answer(
        question=question_text,
        answer=user_answer,
        resume_text=resume_text[:3000],
        topic=question_data.get("difficulty", "intermediate"),
        difficulty="adaptive",
    )

    # Generate feedback
    feedback = generate_feedback(evaluation, "default")
    feedback_md = format_feedback_markdown(feedback)

    import json
    eval_details = {
        "technical_knowledge": evaluation.technical_knowledge,
        "communication": evaluation.communication,
        "confidence": evaluation.confidence,
        "relevance": evaluation.relevance,
        "feedback_text": evaluation.feedback,
        "improvement_tips": evaluation.improvement_tips,
        "ideal_answer": evaluation.ideal_answer
    }

    # Save to DB
    await add_interview_answer(
        db,
        session_id=session_id,
        question=question_text,
        user_answer=user_answer,
        ideal_answer=evaluation.ideal_answer,
        score=evaluation.overall_score,
        feedback=json.dumps(eval_details),
    )

    # Track
    track_answer_evaluated(user_id, question_data.get("difficulty", "general"), evaluation.overall_score)

    next_question_data = None
    if evaluation.next_question:
        next_idx = len(questions)
        _session_questions[session_id].append(evaluation.next_question.model_dump())
        next_question_data = {
            "question_id": next_idx,
            "question": evaluation.next_question.question,
            "difficulty": evaluation.next_question.difficulty,
        }

    return {
        "score": evaluation.overall_score,
        "feedback": feedback_md,
        "evaluation": evaluation.model_dump(),
        "next_question": next_question_data
    }


async def complete_session(db: AsyncSession, session_id: int, user_id: int) -> dict:
    """Complete a mock interview session and calculate final score."""
    from app.database.models import InterviewAnswer
    from sqlalchemy import select

    result = await db.execute(
        select(InterviewAnswer).where(InterviewAnswer.session_id == session_id)
    )
    answers = list(result.scalars().all())

    if not answers:
        return {"error": "No answers found for this session"}

    avg_score = sum(a.score for a in answers if a.score) / max(len(answers), 1)

    feedback = {
        "total_questions": len(answers),
        "answered": len([a for a in answers if a.user_answer]),
        "average_score": round(avg_score, 2),
    }

    await complete_interview_session(db, session_id, avg_score, feedback)

    # Update long-term memory
    from app.memory.long_term import record_interview_score
    await record_interview_score(db, user_id, avg_score)

    return {
        "session_id": session_id,
        "average_score": round(avg_score, 2),
        "total_questions": len(answers),
        "status": "completed",
    }


async def get_history(db: AsyncSession, user_id: int) -> list[dict]:
    """Get interview session history for a user."""
    sessions = await get_user_sessions(db, user_id)
    return [
        {
            "session_id": s.id,
            "topic": s.topic,
            "difficulty": s.difficulty,
            "score": s.score,
            "status": s.status,
            "created_at": s.created_at.isoformat(),
        }
        for s in sessions
    ]
