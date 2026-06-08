"""
Scoring rubrics for different interview topics.
"""

RUBRICS = {
    "dsa": {
        "max_score": 10,
        "criteria": {
            "algorithm_correctness": 3,
            "time_complexity": 2,
            "space_complexity": 1,
            "edge_cases": 2,
            "explanation_clarity": 2,
        },
        "passing_score": 6,
    },
    "ml": {
        "max_score": 10,
        "criteria": {
            "concept_understanding": 3,
            "mathematical_foundation": 2,
            "practical_application": 2,
            "recent_developments": 1,
            "explanation_clarity": 2,
        },
        "passing_score": 6,
    },
    "nlp": {
        "max_score": 10,
        "criteria": {
            "linguistic_concepts": 2,
            "model_architecture": 3,
            "practical_usage": 2,
            "evaluation_metrics": 1,
            "explanation_clarity": 2,
        },
        "passing_score": 6,
    },
    "system_design": {
        "max_score": 10,
        "criteria": {
            "requirements_analysis": 2,
            "architecture_design": 3,
            "scalability": 2,
            "trade_offs": 2,
            "explanation_clarity": 1,
        },
        "passing_score": 7,
    },
    "hr": {
        "max_score": 10,
        "criteria": {
            "self_awareness": 2,
            "situation_handling": 3,
            "communication": 3,
            "enthusiasm": 2,
        },
        "passing_score": 6,
    },
    "default": {
        "max_score": 10,
        "criteria": {
            "accuracy": 3,
            "completeness": 3,
            "clarity": 2,
            "examples": 2,
        },
        "passing_score": 6,
    },
}


def get_rubric(topic: str) -> dict:
    """Get the scoring rubric for a topic."""
    return RUBRICS.get(topic.lower(), RUBRICS["default"])


def is_passing(score: float, topic: str) -> bool:
    """Check if a score is passing for a given topic."""
    rubric = get_rubric(topic)
    return score >= rubric["passing_score"]
