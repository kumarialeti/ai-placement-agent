"""
LangChain Tool — Interview Question Generator.
Generates interview questions by topic and difficulty.
"""

from langchain_core.tools import tool

from app.llm.openai_client import get_structured_llm
from app.llm.output_parsers import InterviewQuestionsOutput
from app.llm.prompts import INTERVIEW_QUESTIONS_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)


@tool
def generate_interview_questions(topic: str, resume_text: str = "", difficulty: str = "intermediate", num_questions: int = 5) -> dict:
    """Generate interview questions for a specific topic and difficulty level.
    
    Args:
        topic: The subject area (e.g., 'NLP', 'DSA', 'Python', 'System Design').
        resume_text: The text of the candidate's resume to tailor the questions to.
        difficulty: Question difficulty — 'beginner', 'intermediate', or 'advanced'.
        num_questions: Number of questions to generate (1-20).
    
    Returns:
        A dictionary with the list of questions, each containing question text, key points, and difficulty.
    """
    logger.info(f"Generating {num_questions} {difficulty} questions on {topic} tailored to resume...")

    llm = get_structured_llm(InterviewQuestionsOutput, temperature=0.7)
    chain = INTERVIEW_QUESTIONS_PROMPT | llm

    result: InterviewQuestionsOutput = chain.invoke({
        "topic": topic,
        "resume_text": resume_text,
        "difficulty": difficulty,
        "num_questions": num_questions,
    })

    logger.info(f"Generated {len(result.questions)} questions on {topic}")
    return result.model_dump()
