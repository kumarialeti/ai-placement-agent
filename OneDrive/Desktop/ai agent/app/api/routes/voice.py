"""
Voice API routes — handle audio transcription.
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.auth.middleware import get_current_user
from app.database.models import User
from app.services.voice_service import transcribe_audio

router = APIRouter(prefix="/voice", tags=["Voice"])

@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Transcribe an uploaded audio file using Groq Whisper API.
    """
    if not file.content_type.startswith("audio/"):
        # Browsers sometimes send webm/video if they are missing audio/webm MIME config, 
        # so we also check if it's video/webm just in case it's webm audio.
        if not file.content_type in ["video/webm", "application/octet-stream"]:
            raise HTTPException(status_code=400, detail="Invalid file format. Must be an audio file.")

    try:
        audio_bytes = await file.read()
        text = await transcribe_audio(audio_bytes, file.filename)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
