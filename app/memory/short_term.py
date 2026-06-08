"""
Short-term memory — in-memory conversation buffer per session.
"""

from collections import defaultdict

from app.utils.logger import get_logger

logger = get_logger(__name__)

# In-memory store: session_id -> list of messages
_session_buffers: dict[str, list[dict]] = defaultdict(list)
MAX_BUFFER_SIZE = 50


def add_message(session_id: str, role: str, content: str, metadata: dict | None = None):
    """Add a message to the session buffer."""
    message = {"role": role, "content": content, "metadata": metadata or {}}
    _session_buffers[session_id].append(message)

    # Trim if too large (keep recent messages)
    if len(_session_buffers[session_id]) > MAX_BUFFER_SIZE:
        _session_buffers[session_id] = _session_buffers[session_id][-MAX_BUFFER_SIZE:]

    logger.debug(f"Session {session_id}: {len(_session_buffers[session_id])} messages in buffer")


def get_history(session_id: str, limit: int = 10) -> list[dict]:
    """Get recent conversation history for a session."""
    return _session_buffers[session_id][-limit:]


def get_formatted_history(session_id: str, limit: int = 10) -> str:
    """Get conversation history as a formatted string."""
    messages = get_history(session_id, limit)
    if not messages:
        return "No previous conversation."

    formatted = []
    for msg in messages:
        role = "User" if msg["role"] == "user" else "Assistant"
        formatted.append(f"{role}: {msg['content']}")

    return "\n".join(formatted)


def clear_session(session_id: str):
    """Clear a session's buffer."""
    _session_buffers.pop(session_id, None)
    logger.info(f"Cleared session buffer: {session_id}")
