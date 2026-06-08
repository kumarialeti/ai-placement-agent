"""
Feedback generation based on evaluation results.
"""

from app.evaluation.rubric import get_rubric, is_passing
from app.llm.output_parsers import AnswerEvaluationOutput
from app.utils.logger import get_logger

logger = get_logger(__name__)


def generate_feedback(evaluation: AnswerEvaluationOutput, topic: str) -> dict:
    """Generate comprehensive feedback from evaluation results."""
    rubric = get_rubric(topic)
    passed = is_passing(evaluation.overall_score, topic)

    feedback = {
        "passed": passed,
        "overall_score": evaluation.overall_score,
        "max_score": rubric["max_score"],
        "passing_score": rubric["passing_score"],
        "scores": {
            "technical_knowledge": evaluation.technical_knowledge,
            "communication": evaluation.communication,
            "confidence": evaluation.confidence,
            "relevance": evaluation.relevance,
        },
        "feedback": evaluation.feedback,
        "ideal_answer": evaluation.ideal_answer,
        "improvement_tips": evaluation.improvement_tips,
        "verdict": "✅ PASS" if passed else "❌ NEEDS IMPROVEMENT",
        "encouragement": _get_encouragement(evaluation.overall_score),
    }

    return feedback


def _get_encouragement(score: float) -> str:
    """Get an encouraging message based on score."""
    if score >= 9:
        return "🌟 Excellent! You're interview-ready on this topic!"
    elif score >= 7:
        return "💪 Great job! A little more polish and you'll ace it."
    elif score >= 5:
        return "📚 Good foundation! Focus on the improvement tips to level up."
    elif score >= 3:
        return "🔄 Keep practicing! Review the ideal answer and try again."
    else:
        return "🎯 Don't give up! Start with the basics and build from there."


def format_feedback_markdown(feedback: dict) -> str:
    """Format feedback as a markdown string."""
    md = f"""## 📊 Answer Evaluation

**Verdict:** {feedback['verdict']}
**Score:** {feedback['overall_score']}/10 (Pass: {feedback['passing_score']})

### Scores Breakdown
| Dimension | Score |
|---|---|
| Technical Knowledge | {feedback['scores']['technical_knowledge']}/10 |
| Communication | {feedback['scores']['communication']}/10 |
| Confidence | {feedback['scores']['confidence']}/10 |
| Relevance | {feedback['scores']['relevance']}/10 |

### 💬 Feedback
{feedback['feedback']}

### ✅ Ideal Answer
{feedback['ideal_answer']}

### 💡 Improvement Tips
{chr(10).join(f'- {tip}' for tip in feedback['improvement_tips'])}

{feedback['encouragement']}
"""
    return md
