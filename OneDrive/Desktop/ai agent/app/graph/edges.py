"""
LangGraph conditional edge routing based on detected intent.
"""

from app.graph.state import AgentState
from app.utils.constants import INTENT_TYPES
from app.utils.logger import get_logger

logger = get_logger(__name__)


def route_by_intent(state: AgentState) -> str:
    """Route to the appropriate node based on detected intent."""
    intent = state.get("intent", "general_chat")
    logger.info(f"Routing to: {intent}")

    route_map = {
        "resume_analysis": "resume_analysis",
        "job_matching": "job_matching",
        "interview_questions": "interview_questions",
        "mock_interview": "interview_questions",
        "rag_search": "rag_search",
        "study_roadmap": "study_roadmap",
        "general_chat": "general_chat",
    }

    return route_map.get(intent, "general_chat")
