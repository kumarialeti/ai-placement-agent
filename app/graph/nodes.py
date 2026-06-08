"""
LangGraph node functions — each node processes the state and returns updates.
"""

from app.agents.manager_agent import create_manager_agent
from app.graph.state import AgentState
from app.llm.openai_client import get_llm, get_structured_llm
from app.llm.output_parsers import IntentOutput
from app.llm.prompts import INTENT_DETECTION_PROMPT
from app.rag.retriever import retrieve_as_context
from app.tools.interview_tool import generate_interview_questions
from app.tools.jd_match_tool import match_job_description
from app.tools.resume_parser_tool import parse_resume
from app.tools.roadmap_tool import generate_roadmap
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Lazy manager agent
_manager = None


def _get_manager():
    global _manager
    if _manager is None:
        _manager = create_manager_agent()
    return _manager


def intent_detection_node(state: AgentState) -> dict:
    """Detect user intent from the input message."""
    logger.info(f"Detecting intent for: '{state['user_input'][:50]}...'")

    try:
        llm = get_structured_llm(IntentOutput, temperature=0.1)
        chain = INTENT_DETECTION_PROMPT | llm
        result: IntentOutput = chain.invoke({"message": state["user_input"]})

        logger.info(f"Intent: {result.intent} (confidence: {result.confidence})")
        return {
            "intent": result.intent,
            "confidence": result.confidence,
            "entities": result.entities,
        }
    except Exception as e:
        logger.error(f"Intent detection failed: {e}")
        return {
            "intent": "general_chat",
            "confidence": 0.5,
            "entities": {},
        }


def resume_analysis_node(state: AgentState) -> dict:
    """Handle resume analysis requests."""
    logger.info("Running resume analysis node...")

    resume_text = state.get("resume_text", "")
    if not resume_text:
        return {
            "agent_output": "Please upload your resume first so I can analyze it. Use the resume upload endpoint.",
            "current_agent": "resume",
        }

    try:
        result = parse_resume.invoke({"resume_text": resume_text})
        import json
        output = f"""## 📄 Resume Analysis Complete

**ATS Score:** {result['ats_score']}/100

### ✅ Skills Identified
{chr(10).join(f'- {s}' for s in result['skills'])}

### 💪 Strengths
{chr(10).join(f'- {s}' for s in result['strengths'])}

### ⚠️ Weaknesses
{chr(10).join(f'- {w}' for w in result['weaknesses'])}

### 💡 Suggestions
{chr(10).join(f'- {s}' for s in result['suggestions'])}

**Experience Level:** {result['experience_level']}
**Summary:** {result['summary']}"""

        return {"agent_output": output, "current_agent": "resume"}
    except Exception as e:
        logger.error(f"Resume analysis failed: {e}")
        return {"agent_output": f"Error analyzing resume: {str(e)}", "error": str(e)}


def job_matching_node(state: AgentState) -> dict:
    """Handle job description matching."""
    logger.info("Running job matching node...")

    resume_text = state.get("resume_text", "")
    jd = state.get("job_description", "")

    if not resume_text or not jd:
        return {
            "agent_output": "Please provide both your resume and the job description for matching.",
            "current_agent": "job",
        }

    try:
        result = match_job_description.invoke({
            "resume_text": resume_text,
            "job_description": jd,
        })

        output = f"""## 🎯 Job Match Analysis

**Match Score: {result['match_score']}%**

### ✅ Matching Skills
{chr(10).join(f'- {s}' for s in result['matching_skills'])}

### ❌ Missing Skills
{chr(10).join(f'- {s}' for s in result['missing_skills'])}

### 💡 Recommendations
{chr(10).join(f'- {r}' for r in result['recommendations'])}

**Summary:** {result['summary']}"""

        return {"agent_output": output, "current_agent": "job"}
    except Exception as e:
        logger.error(f"Job matching failed: {e}")
        return {"agent_output": f"Error matching: {str(e)}", "error": str(e)}


def interview_questions_node(state: AgentState) -> dict:
    """Handle interview question generation."""
    logger.info("Running interview questions node...")

    entities = state.get("entities", {})
    topic = entities.get("topic", "general programming")
    difficulty = entities.get("difficulty", "intermediate")

    try:
        resume_text = state.get("resume_text", "")
        result = generate_interview_questions.invoke({
            "topic": topic,
            "resume_text": resume_text,
            "difficulty": difficulty,
            "num_questions": 5,
        })

        questions = result["questions"]
        output = f"## 📝 Interview Questions — {topic.title()} ({difficulty})\n\n"
        for i, q in enumerate(questions, 1):
            output += f"### Question {i} [{q['difficulty']}]\n{q['question']}\n\n"
            output += f"**Key Points:** {', '.join(q['key_points'])}\n\n---\n\n"

        return {"agent_output": output, "current_agent": "interview"}
    except Exception as e:
        logger.error(f"Question generation failed: {e}")
        return {"agent_output": f"Error generating questions: {str(e)}", "error": str(e)}


def rag_search_node(state: AgentState) -> dict:
    """Handle RAG-based knowledge search."""
    logger.info("Running RAG search node...")

    query = state["user_input"]
    entities = state.get("entities", {})
    category = entities.get("category")

    try:
        context = retrieve_as_context(query=query, category=category)
        llm = get_llm(temperature=0.3)

        from app.rag.prompt import RAG_QA_PROMPT
        chain = RAG_QA_PROMPT | llm
        response = chain.invoke({"context": context, "question": query})

        return {
            "agent_output": response.content,
            "current_agent": "rag",
            "sources": [context[:200]],
        }
    except Exception as e:
        logger.error(f"RAG search failed: {e}")
        return {"agent_output": f"Error searching knowledge base: {str(e)}", "error": str(e)}

def _extract_role_from_message(message: str) -> str | None:
    """Try to extract a job role from the user's raw message using pattern matching."""
    import re
    # Common patterns: "for ML Engineer", "for a Backend Developer role", "for Data Scientist"
    patterns = [
        r'(?:for|as)\s+(?:a\s+)?(?:an?\s+)?(.+?)\s*(?:role|position|job|career)?\s*$',
        r'(?:roadmap|plan|study)\s+(?:for|to become)\s+(?:a\s+)?(?:an?\s+)?(.+?)(?:\s+role|\s+position)?\s*$',
    ]
    for pattern in patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            role = match.group(1).strip().rstrip('.')
            # Filter out very long matches (likely not a role name)
            if len(role) < 50 and len(role) > 1:
                return role
    
    # Keyword-based: look for known role keywords
    known_roles = [
        "ML Engineer", "Machine Learning Engineer", "Data Scientist", "Data Analyst",
        "Backend Developer", "Frontend Developer", "Full Stack Developer", "Fullstack Developer",
        "Software Engineer", "Software Developer", "DevOps Engineer", "Cloud Engineer",
        "AI Engineer", "NLP Engineer", "Deep Learning Engineer", "Data Engineer",
        "iOS Developer", "Android Developer", "Mobile Developer", "Web Developer",
        "System Design Engineer", "Platform Engineer", "QA Engineer", "Test Engineer",
        "Product Manager", "Technical Lead", "Tech Lead", "SDE", "SRE",
    ]
    message_lower = message.lower()
    for role in known_roles:
        if role.lower() in message_lower:
            return role
    return None


def study_roadmap_node(state: AgentState) -> dict:
    """Handle study roadmap generation."""
    logger.info("Running roadmap generation node...")

    entities = state.get("entities", {})
    user_input = state.get("user_input", "")

    # Extract target_role from entities — try multiple keys, then fall back to parsing the user message
    target_role = (
        entities.get("role")
        or entities.get("target_role")
        or _extract_role_from_message(user_input)
        or "Software Engineer"
    )
    weak_areas = entities.get("weak_areas", "general")
    duration_weeks = entities.get("duration_weeks", 4)

    # Ensure duration_weeks is an int
    try:
        duration_weeks = int(duration_weeks)
    except (ValueError, TypeError):
        duration_weeks = 4

    logger.info(f"Roadmap params — role: {target_role}, weeks: {duration_weeks}, weak_areas: {weak_areas}")

    try:
        result = generate_roadmap.invoke({
            "target_role": target_role,
            "duration_weeks": duration_weeks,
            "weak_areas": weak_areas if isinstance(weak_areas, str) else ", ".join(weak_areas),
        })

        output = f"## 🗺️ {result['duration_weeks']}-Week Study Roadmap for {result['target_role']}\n\n"
        for week in result["roadmap"]:
            output += f"### 📅 Week {week['week']}: {week['theme']}\n"
            output += f"**Topics:** {', '.join(week['topics'])}\n\n"
            output += "**Daily Tasks:**\n"
            output += "\n".join(f"- {t}" for t in week["daily_tasks"])
            output += f"\n\n**Resources:** {', '.join(week['resources'])}\n\n---\n\n"

        if result.get("tips"):
            output += "### 💡 General Tips\n"
            output += "\n".join(f"- {t}" for t in result["tips"])

        return {"agent_output": output, "current_agent": "roadmap"}
    except Exception as e:
        logger.error(f"Roadmap generation failed: {e}")
        return {"agent_output": f"Error generating roadmap: {str(e)}", "error": str(e)}


def general_chat_node(state: AgentState) -> dict:
    """Handle general chat using the manager agent."""
    logger.info("Running general chat node...")

    try:
        manager = _get_manager()
        result = manager.invoke({"input": state["user_input"]})
        return {"agent_output": result["output"], "current_agent": "manager"}
    except Exception as e:
        logger.error(f"General chat failed: {e}")
        # Fallback to direct LLM
        try:
            llm = get_llm()
            response = llm.invoke(state["user_input"])
            return {"agent_output": response.content, "current_agent": "fallback"}
        except Exception as e2:
            return {"agent_output": f"I encountered an error: {str(e2)}", "error": str(e2)}
