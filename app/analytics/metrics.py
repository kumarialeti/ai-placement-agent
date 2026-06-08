"""
Aggregate metrics calculation for user analytics.
"""

from collections import Counter

from app.analytics.tracker import get_events
from app.utils.logger import get_logger

logger = get_logger(__name__)


def get_user_metrics(user_id: int) -> dict:
    """Calculate aggregate metrics for a user."""
    all_events = get_events(user_id)

    # Count by type
    event_counts = Counter(e["type"] for e in all_events)

    # Score history
    evaluations = get_events(user_id, "answer_evaluated")
    score_history = [
        {"topic": e["data"]["topic"], "score": e["data"]["score"], "timestamp": e["timestamp"]}
        for e in evaluations
    ]

    # Topic coverage
    questions = get_events(user_id, "question_asked")
    topics_covered = list(set(e["data"]["topic"] for e in questions))

    # Average score by topic
    topic_scores = {}
    for e in evaluations:
        topic = e["data"]["topic"]
        if topic not in topic_scores:
            topic_scores[topic] = []
        topic_scores[topic].append(e["data"]["score"])

    avg_by_topic = {
        topic: round(sum(scores) / len(scores), 2)
        for topic, scores in topic_scores.items()
    }

    # Weak and strong areas
    weak_areas = [t for t, avg in avg_by_topic.items() if avg < 6]
    strong_areas = [t for t, avg in avg_by_topic.items() if avg >= 7]

    return {
        "total_questions": event_counts.get("question_asked", 0),
        "total_evaluations": event_counts.get("answer_evaluated", 0),
        "total_searches": event_counts.get("rag_search", 0),
        "topics_covered": topics_covered,
        "score_history": score_history[-20:],  # Last 20
        "avg_by_topic": avg_by_topic,
        "weak_areas": weak_areas,
        "strong_areas": strong_areas,
        "overall_avg": round(
            sum(e["data"]["score"] for e in evaluations) / max(len(evaluations), 1), 2
        ),
    }
