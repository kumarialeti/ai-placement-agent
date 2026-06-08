"""
Pydantic models for structured LLM outputs.
Ensures type-safe, reliable parsing of LLM responses.
"""

from pydantic import BaseModel, Field


class ResumeAnalysisOutput(BaseModel):
    """Structured output for resume analysis."""
    skills: list[str] = Field(description="List of technical and soft skills identified")
    strengths: list[str] = Field(description="Key strengths of the resume")
    weaknesses: list[str] = Field(description="Areas for improvement")
    ats_score: float = Field(ge=0, le=100, description="ATS compatibility score")
    suggestions: list[str] = Field(description="Actionable improvement suggestions")
    experience_level: str = Field(description="fresher, junior, mid, senior")
    summary: str = Field(description="Brief professional summary")


class JDMatchOutput(BaseModel):
    """Structured output for job description matching."""
    match_score: float = Field(ge=0, le=100, description="Overall match percentage")
    matching_skills: list[str] = Field(description="Skills found in both resume and JD")
    missing_skills: list[str] = Field(description="Skills in JD but not in resume")
    recommendations: list[str] = Field(description="How to improve the match")
    summary: str = Field(description="Brief match analysis summary")


class InterviewQuestion(BaseModel):
    """Single interview question with metadata."""
    question: str = Field(description="The interview question")
    key_points: list[str] = Field(description="Expected key points in the answer")
    difficulty: str = Field(description="beginner, intermediate, or advanced")


class InterviewQuestionsOutput(BaseModel):
    """Structured output for interview question generation."""
    questions: list[InterviewQuestion] = Field(description="List of generated questions")
    topic: str = Field(description="The topic these questions cover")


class AnswerEvaluationOutput(BaseModel):
    """Structured output for answer evaluation."""
    technical_knowledge: float = Field(ge=0, le=10, description="Technical knowledge and factual correctness score out of 10")
    communication: float = Field(ge=0, le=10, description="Communication clarity, structure, and articulation score out of 10")
    confidence: float = Field(ge=0, le=10, description="Confidence, tone, and certainty score out of 10")
    relevance: float = Field(ge=0, le=10, description="Relevance and directness of the answer score out of 10")
    overall_score: float = Field(ge=0, le=10, description="Overall score out of 10 (average of all dimensions)")
    feedback: str = Field(description="Detailed evaluation feedback explaining the scoring")
    ideal_answer: str = Field(description="Model/ideal answer")
    improvement_tips: list[str] = Field(description="Specific tips to improve")
    next_question: InterviewQuestion | None = Field(default=None, description="The next interview question to ask, if applicable")


class RoadmapWeekOutput(BaseModel):
    """Single week in a study roadmap."""
    week: int = Field(description="Week number")
    theme: str = Field(description="Week's focus theme")
    topics: list[str] = Field(description="Topics to cover")
    daily_tasks: list[str] = Field(description="Daily activities")
    resources: list[str] = Field(description="Recommended resources")


class StudyRoadmapOutput(BaseModel):
    """Structured output for study roadmap generation."""
    target_role: str = Field(description="Target job role")
    duration_weeks: int = Field(description="Total weeks")
    roadmap: list[RoadmapWeekOutput] = Field(description="Week-by-week plan")
    tips: list[str] = Field(description="General preparation tips")


class IntentOutput(BaseModel):
    """Structured output for intent detection."""
    intent: str = Field(description="Detected intent type")
    confidence: float = Field(ge=0, le=1, description="Confidence score")
    entities: dict = Field(default_factory=dict, description="Extracted entities like topic, difficulty")
