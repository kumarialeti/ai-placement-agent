"""
LangChain Tool — Resume Parser.
Extracts skills, experience, education from resume text.
"""

from langchain_core.tools import tool

from app.llm.openai_client import get_structured_llm
from app.llm.output_parsers import ResumeAnalysisOutput
from app.llm.prompts import RESUME_ANALYSIS_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)


@tool
def parse_resume(resume_text: str) -> dict:
    """Analyze a resume and extract skills, strengths, weaknesses, and ATS score.
    
    Args:
        resume_text: The full text content of the resume to analyze.
    
    Returns:
        A dictionary containing skills, strengths, weaknesses, ATS score, and suggestions.
    """
    logger.info("Parsing resume...")

    llm = get_structured_llm(ResumeAnalysisOutput, temperature=0.3)
    chain = RESUME_ANALYSIS_PROMPT | llm

    result: ResumeAnalysisOutput = chain.invoke({"resume_text": resume_text})

    logger.info(f"Resume parsed — ATS Score: {result.ats_score}, Skills: {len(result.skills)}")
    return result.model_dump()
