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


import json

async def process_message_stream(
    user_input: str,
    user_id: int,
    session_id: str | None = None,
    resume_text: str = "",
    job_description: str = "",
):
    """
    Process a user message through the LangGraph workflow and yield SSE chunks.
    """
    if not session_id:
        session_id = str(uuid.uuid4())

    logger.info(f"Processing message stream for user {user_id}, session {session_id}")

    # Add to short-term memory
    add_message(session_id, "user", user_input)
    chat_history_str = get_formatted_history(session_id, limit=5)

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

    graph = _get_graph()
    
    yield f"data: {json.dumps({'type': 'start', 'session_id': session_id})}\n\n"

    try:
        # We need to collect the chunks to store in memory at the end
        full_response = ""
        intent = "general_chat"
        current_agent = "unknown"
        
        # astream_events yields a variety of events. 
        # "on_chat_model_stream" gives us the raw tokens
        async for event in graph.astream_events(initial_state, version="v2"):
            kind = event["event"]
            
            if kind == "on_chat_model_stream":
                chunk = event["data"]["chunk"]
                if hasattr(chunk, "content") and chunk.content:
                    full_response += chunk.content
                    yield f"data: {json.dumps({'type': 'token', 'content': chunk.content})}\n\n"
            
            elif kind == "on_chain_end":
                # Look for the final state updates to extract intent
                if event.get("name") in ["intent_detection", "resume_analysis", "job_matching", "interview_questions", "rag_search", "study_roadmap", "general_chat"]:
                    if "output" in event["data"] and isinstance(event["data"]["output"], dict):
                        output = event["data"]["output"]
                        if "intent" in output and output["intent"]:
                            intent = output["intent"]
                        if "current_agent" in output and output["current_agent"]:
                            current_agent = output["current_agent"]

        # If the workflow didn't use a chat model that streamed (or if it set agent_output directly)
        if not full_response:
            # Re-run invoke to just get the final output if streaming failed (fallback)
            fallback_result = await graph.ainvoke(initial_state)
            full_response = fallback_result.get("agent_output", "I'm not sure how to help with that.")
            intent = fallback_result.get("intent", "general_chat")
            yield f"data: {json.dumps({'type': 'token', 'content': full_response})}\n\n"

        # Save to short term memory
        add_message(session_id, "assistant", full_response, {"intent": intent})
        
        # We yield a final 'done' event with the full string so the router can save to the DB
        yield f"data: {json.dumps({'type': 'done', 'intent': intent, 'agent': current_agent, 'full_response': full_response})}\n\n"

    except Exception as e:
        logger.error(f"Stream processing error: {e}")
        error_response = f"Error: {str(e)}"
        add_message(session_id, "assistant", error_response)
        yield f"data: {json.dumps({'type': 'error', 'content': error_response})}\n\n"
