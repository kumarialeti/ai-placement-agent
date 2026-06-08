"""
Report generation for user progress tracking.
"""

from app.analytics.metrics import get_user_metrics
from app.utils.logger import get_logger

logger = get_logger(__name__)


def generate_progress_report(user_id: int) -> str:
    """Generate a markdown progress report for a user."""
    metrics = get_user_metrics(user_id)

    report = f"""## 📊 Your Progress Report

### 📈 Overview
| Metric | Value |
|---|---|
| Questions Practiced | {metrics['total_questions']} |
| Answers Evaluated | {metrics['total_evaluations']} |
| Knowledge Searches | {metrics['total_searches']} |
| Overall Average Score | {metrics['overall_avg']}/10 |

### 📚 Topics Covered
{', '.join(metrics['topics_covered']) if metrics['topics_covered'] else 'No topics covered yet'}

### 💪 Strong Areas
{chr(10).join(f'- ✅ {area} ({metrics["avg_by_topic"].get(area, 0)}/10)' for area in metrics['strong_areas']) if metrics['strong_areas'] else '- Keep practicing to identify your strengths!'}

### ⚠️ Areas to Improve
{chr(10).join(f'- 📚 {area} ({metrics["avg_by_topic"].get(area, 0)}/10)' for area in metrics['weak_areas']) if metrics['weak_areas'] else '- Great job! No weak areas identified.'}

### 📉 Score Trend (Last 10)
"""
    if metrics['score_history']:
        for entry in metrics['score_history'][-10:]:
            emoji = "🟢" if entry['score'] >= 7 else "🟡" if entry['score'] >= 5 else "🔴"
            report += f"- {emoji} {entry['topic']}: {entry['score']}/10\n"
    else:
        report += "- No scores recorded yet. Start a mock interview!\n"

    return report
