"""
Chat API routes — send messages, get history.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware import get_current_user
from app.database.connection import get_db
from app.database.crud import get_chat_history, save_chat_message
from app.database.models import User
from app.database.schemas import ChatRequest, ChatResponse
from app.services.chat_service import process_message
from app.services.resume_service import get_resume_text

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/send", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message to the AI agent."""
    # Get resume context if available
    resume_text = await get_resume_text(db, current_user.id)

    # Process through LangGraph
    result = await process_message(
        user_input=request.message,
        user_id=current_user.id,
        session_id=request.session_id,
        resume_text=resume_text,
    )

    # Save to DB
    await save_chat_message(db, current_user.id, "user", request.message, result.get("intent"))
    await save_chat_message(db, current_user.id, "assistant", result["response"], result.get("intent"))

    return ChatResponse(
        response=result["response"],
        intent=result.get("intent", "general_chat"),
        sources=result.get("sources", []),
        metadata={"agent": result.get("agent", ""), "session_id": result.get("session_id", "")},
    )


@router.get("/history")
async def get_history(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get chat history for the current user."""
    messages = await get_chat_history(db, current_user.id, limit)
    return [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "intent": msg.intent,
            "created_at": msg.created_at.isoformat(),
        }
        for msg in messages
    ]
