"""
Voice Service — Handles Speech-to-Text using Groq Whisper.
"""

import os
import tempfile
from groq import AsyncGroq
from app.utils.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

async def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    """
    Transcribes audio bytes to text using Groq's whisper-large-v3 model.
    """
    settings = get_settings()
    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    
    # Write to a temporary file since Groq expects a file object
    ext = filename.split(".")[-1] if "." in filename else "webm"
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp_file:
        tmp_file.write(audio_bytes)
        tmp_file_path = tmp_file.name

    try:
        with open(tmp_file_path, "rb") as file:
            transcription = await client.audio.transcriptions.create(
                file=(filename, file.read()),
                model="whisper-large-v3",
            )
        return transcription.text
    except Exception as e:
        logger.error(f"Error transcribing audio: {e}")
        raise e
    finally:
        # Clean up
        if os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)
