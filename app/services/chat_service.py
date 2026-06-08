"""
Chat service — main orchestrator that invokes the LangGraph workflow.
"""

import uuid

from app.graph.workflow import get_compiled_graph
from app.memory.short_term import add_message, get_formatted_history
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Lazy compiled graph
_graph = None


def _get_graph():
    global _graph
    if _graph is None:
        _graph = get_compiled_graph()
    return _graph


async def process_message(
    user_input: str,
    user_id: int,
    session_id: str | None = None,
    resume_text: str = "",
    job_description: str = "",
) -> dict:
    """
    Process a user message through the LangGraph workflow.

    Returns dict with response, intent, sources.
    """
    if not session_id:
        session_id = str(uuid.uuid4())

    logger.info(f"Processing message for user {user_id}, session {session_id}")

    # Add to short-term memory
    add_message(session_id, "user", user_input)

    # Get chat history
    chat_history_str = get_formatted_history(session_id, limit=5)

    # Build initial state
    initial_state = {
        "messages": [],
        "user_input": user_input,
        "intent": "",
        "confidence": 0.0,
        "entities": {},
        "user_id": user_id,
        "resume_text": resume_text,
        "job_description": job_description,
        "agent_output": "",
        "sources": [],
        "chat_history": [],
        "user_profile": {},
        "current_agent": "",
        "error": None,
    }

    try:
        # Run the graph
        graph = _get_graph()
        result = graph.invoke(initial_state)

        response = result.get("agent_output", "I'm not sure how to help with that. Could you rephrase?")
        intent = result.get("intent", "general_chat")
        sources = result.get("sources", [])

        # Save assistant response to memory
        add_message(session_id, "assistant", response, {"intent": intent})

        logger.info(f"Response generated — Intent: {intent}, Agent: {result.get('current_agent', 'unknown')}")

        return {
            "response": response,
            "intent": intent,
            "sources": sources,
            "session_id": session_id,
            "agent": result.get("current_agent", ""),
        }

    except Exception as e:
        logger.error(f"Chat processing error: {e}")
        error_response = f"I encountered an error processing your request. Please try again. Error: {str(e)}"
        add_message(session_id, "assistant", error_response)
        return {
            "response": error_response,
            "intent": "error",
            "sources": [],
            "session_id": session_id,
            "agent": "error",
        }
