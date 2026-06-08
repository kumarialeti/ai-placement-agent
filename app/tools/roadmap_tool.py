"""
LangChain Tool — Study Roadmap Generator.
Creates personalized study plans based on weak areas.
"""

from langchain_core.tools import tool

from app.llm.openai_client import get_structured_llm
from app.llm.output_parsers import StudyRoadmapOutput
from app.llm.prompts import ROADMAP_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)


@tool
def generate_roadmap(target_role: str, duration_weeks: int = 4, weak_areas: str = "general") -> dict:
    """Generate a personalized study roadmap for placement preparation.
    
    Args:
        target_role: The job role being targeted (e.g., 'ML Engineer', 'Backend Developer').
        duration_weeks: Duration of the study plan in weeks (1-12).
        weak_areas: Comma-separated list of weak areas to focus on.
    
    Returns:
        A week-by-week study plan with topics, tasks, and resources.
    """
    logger.info(f"Generating {duration_weeks}-week roadmap for {target_role}...")

    llm = get_structured_llm(StudyRoadmapOutput, temperature=0.7)
    chain = ROADMAP_PROMPT | llm

    result: StudyRoadmapOutput = chain.invoke({
        "target_role": target_role,
        "duration_weeks": duration_weeks,
        "weak_areas": weak_areas,
    })

    logger.info(f"Generated {len(result.roadmap)}-week roadmap")
    return result.model_dump()
