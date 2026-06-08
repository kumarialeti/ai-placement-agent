"""
Agent tests — testing evaluation and analytics components.
"""

import pytest

from app.evaluation.rubric import get_rubric, is_passing
from app.analytics.tracker import track_event, track_question_asked, get_events
from app.analytics.metrics import get_user_metrics


def test_get_rubric_dsa():
    """Test getting DSA rubric."""
    rubric = get_rubric("dsa")
    assert rubric["max_score"] == 10
    assert rubric["passing_score"] == 6
    assert "algorithm_correctness" in rubric["criteria"]


def test_get_rubric_default():
    """Test fallback to default rubric."""
    rubric = get_rubric("unknown_topic")
    assert rubric == get_rubric("default")


def test_is_passing():
    """Test passing score check."""
    assert is_passing(7.0, "dsa") is True
    assert is_passing(5.0, "dsa") is False
    assert is_passing(6.0, "dsa") is True


def test_track_event():
    """Test event tracking."""
    track_event(999, "test_event", {"key": "value"})
    events = get_events(999)
    assert len(events) >= 1
    assert events[-1]["type"] == "test_event"


def test_track_question_asked():
    """Test tracking question asked."""
    track_question_asked(998, "python", "intermediate")
    events = get_events(998, "question_asked")
    assert len(events) == 1
    assert events[0]["data"]["topic"] == "python"


def test_get_user_metrics_empty():
    """Test metrics for user with no events."""
    metrics = get_user_metrics(1000)
    assert metrics["total_questions"] == 0
    assert metrics["overall_avg"] == 0
