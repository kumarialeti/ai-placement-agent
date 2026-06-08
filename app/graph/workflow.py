"""
LangGraph StateGraph workflow — compiles the full agent workflow.
"""

from langgraph.graph import END, START, StateGraph

from app.graph.edges import route_by_intent
from app.graph.nodes import (
    general_chat_node,
    intent_detection_node,
    interview_questions_node,
    job_matching_node,
    rag_search_node,
    resume_analysis_node,
    study_roadmap_node,
)
from app.graph.state import AgentState
from app.utils.logger import get_logger

logger = get_logger(__name__)


def build_workflow() -> StateGraph:
    """Build and compile the LangGraph workflow."""
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("intent_detection", intent_detection_node)
    workflow.add_node("resume_analysis", resume_analysis_node)
    workflow.add_node("job_matching", job_matching_node)
    workflow.add_node("interview_questions", interview_questions_node)
    workflow.add_node("rag_search", rag_search_node)
    workflow.add_node("study_roadmap", study_roadmap_node)
    workflow.add_node("general_chat", general_chat_node)

    # Entry point
    workflow.add_edge(START, "intent_detection")

    # Conditional routing from intent detection
    workflow.add_conditional_edges(
        "intent_detection",
        route_by_intent,
        {
            "resume_analysis": "resume_analysis",
            "job_matching": "job_matching",
            "interview_questions": "interview_questions",
            "rag_search": "rag_search",
            "study_roadmap": "study_roadmap",
            "general_chat": "general_chat",
        },
    )

    # All processing nodes lead to END
    workflow.add_edge("resume_analysis", END)
    workflow.add_edge("job_matching", END)
    workflow.add_edge("interview_questions", END)
    workflow.add_edge("rag_search", END)
    workflow.add_edge("study_roadmap", END)
    workflow.add_edge("general_chat", END)

    logger.info("LangGraph workflow compiled successfully")
    return workflow


# Compile the graph
def get_compiled_graph():
    """Get the compiled LangGraph workflow."""
    workflow = build_workflow()
    return workflow.compile()
