"""
LLM-based answer evaluation for mock interviews.
"""

from app.llm.openai_client import get_structured_llm
from app.llm.output_parsers import AnswerEvaluationOutput
from app.llm.prompts import ANSWER_EVALUATION_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)


def evaluate_answer(
    question: str,
    answer: str,
    resume_text: str = "",
    topic: str = "general",
    difficulty: str = "intermediate",
) -> AnswerEvaluationOutput:
    """Evaluate a candidate's answer using LLM-based scoring and generate the next question."""
    logger.info(f"Evaluating answer for topic: {topic}, difficulty: {difficulty}")

    llm = get_structured_llm(AnswerEvaluationOutput, temperature=0.3)
    chain = ANSWER_EVALUATION_PROMPT | llm

    result: AnswerEvaluationOutput = chain.invoke({
        "question": question,
        "answer": answer,
        "resume_text": resume_text,
        "topic": topic,
        "difficulty": difficulty,
    })

    logger.info(
        f"Evaluation — Technical: {result.technical_knowledge}, "
        f"Communication: {result.communication}, "
        f"Confidence: {result.confidence}, "
        f"Relevance: {result.relevance}, "
        f"Overall: {result.overall_score}"
    )
    return result
