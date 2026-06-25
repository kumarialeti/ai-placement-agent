"""
LangGraph state definition.
TypedDict that flows through the graph nodes.
"""

from typing import Annotated

from langgraph.graph.message import add_messages
from typing_extensions import TypedDict


class AgentState(TypedDict):
    """State that flows through the LangGraph workflow."""

    # User input
    messages: Annotated[list, add_messages]
    user_input: str

    # Intent detection
    intent: str
    confidence: float
    entities: dict

    # User context
    user_id: int
    resume_text: str
    job_description: str

    # Agent output
    agent_output: str
    sources: list[str]

    # Memory
    chat_history: list[dict]
    user_profile: dict

    # Control flow
    current_agent: str
    error: str | None
