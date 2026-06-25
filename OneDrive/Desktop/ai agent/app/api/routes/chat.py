"""
Chat API routes — send messages, get history.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import StreamingResponse
import json

from app.auth.middleware import get_current_user
from app.database.connection import get_db
from app.database.crud import get_chat_history, save_chat_message
from app.database.models import User
from app.database.schemas import ChatRequest
from app.services.chat_service import process_message_stream
from app.services.resume_service import get_resume_text

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/send")
async def send_message(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message to the AI agent via Server-Sent Events (SSE)."""
    # Get resume context if available
    resume_text = await get_resume_text(db, current_user.id)

    # Save user message to DB immediately
    await save_chat_message(db, current_user.id, "user", request.message, "general_chat")

    async def event_generator():
        # Process through LangGraph and yield SSE chunks
        async for sse_chunk in process_message_stream(
            user_input=request.message,
            user_id=current_user.id,
            session_id=request.session_id,
            resume_text=resume_text,
        ):
            yield sse_chunk
            
            # Intercept the 'done' event to save the final assistant response to the DB
            if '"type": "done"' in sse_chunk:
                try:
                    data_str = sse_chunk.replace("data: ", "").strip()
                    payload = json.loads(data_str)
                    if payload.get("type") == "done" and payload.get("full_response"):
                        await save_chat_message(
                            db, 
                            current_user.id, 
                            "assistant", 
                            payload["full_response"], 
                            payload.get("intent", "general_chat")
                        )
                except Exception:
                    pass

    return StreamingResponse(event_generator(), media_type="text/event-stream")


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
