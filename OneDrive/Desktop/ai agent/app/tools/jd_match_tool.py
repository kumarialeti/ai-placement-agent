"""
LangChain Tool — Job Description Matcher.
Compares resume against JD and produces match score.
"""

from langchain_core.tools import tool

from app.llm.openai_client import get_structured_llm
from app.llm.output_parsers import JDMatchOutput
from app.llm.prompts import JD_MATCH_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)


@tool
def match_job_description(resume_text: str, job_description: str) -> dict:
    """Match a resume against a job description and return compatibility analysis.
    
    Args:
        resume_text: The full text of the candidate's resume.
        job_description: The job description to match against.
    
    Returns:
        A dictionary with match_score, matching_skills, missing_skills, and recommendations.
    """
    logger.info("Matching resume against job description...")

    llm = get_structured_llm(JDMatchOutput, temperature=0.3)
    chain = JD_MATCH_PROMPT | llm

    result: JDMatchOutput = chain.invoke({
        "resume_text": resume_text,
        "job_description": job_description,
    })

    logger.info(f"JD Match — Score: {result.match_score}%, Missing: {len(result.missing_skills)} skills")
    return result.model_dump()
