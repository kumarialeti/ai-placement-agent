"""
Pydantic schemas for API request/response validation.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ─── Auth Schemas ───


class UserCreate(BaseModel):
    email: str = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    full_name: str | None = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Resume Schemas ───


class ResumeAnalysisResponse(BaseModel):
    skills: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    ats_score: float = Field(ge=0, le=100)
    suggestions: list[str] = Field(default_factory=list)
    experience_level: str = ""
    summary: str = ""


class ResumeResponse(BaseModel):
    id: int
    filename: str
    ats_score: float | None
    analysis: ResumeAnalysisResponse | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Job Matching & Cover Letter Schemas ───


class JDMatchRequest(BaseModel):
    job_description: str = Field(..., min_length=10)
    resume_id: int | None = None


class JDMatchResponse(BaseModel):
    match_score: float = Field(ge=0, le=100)
    matching_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    summary: str = ""


class CoverLetterRequest(BaseModel):
    job_description: str = Field(..., min_length=10)
    company_name: str = Field(..., min_length=1)
    job_title: str = Field(..., min_length=1)


class CoverLetterResponse(BaseModel):
    cover_letter: str


# ─── Interview Schemas ───


class InterviewStartRequest(BaseModel):
    topic: str = Field(..., description="Interview topic")
    difficulty: str = Field(default="intermediate", description="Difficulty level")
    num_questions: int = Field(default=5, ge=1, le=20)


class InterviewQuestionResponse(BaseModel):
    question_id: int
    question: str
    difficulty: str
    topic: str


class AnswerSubmitRequest(BaseModel):
    session_id: int
    question_id: int
    answer: str

    class Config:
        extra = "allow"


class AnswerEvaluationResponse(BaseModel):
    score: float = Field(ge=0, le=10)
    technical_knowledge: float = Field(ge=0, le=10)
    communication: float = Field(ge=0, le=10)
    confidence: float = Field(ge=0, le=10)
    relevance: float = Field(ge=0, le=10)
    feedback: str = ""
    ideal_answer: str = ""
    improvement_tips: list[str] = Field(default_factory=list)
    next_question: dict | None = None


class InterviewSessionResponse(BaseModel):
    session_id: int
    topic: str
    difficulty: str
    total_questions: int
    score: float | None
    status: str
    created_at: datetime


# ─── Chat Schemas ───


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    intent: str
    sources: list[str] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)


# ─── Roadmap Schemas ───


class RoadmapRequest(BaseModel):
    target_role: str = Field(..., description="Target job role, e.g., 'ML Engineer'")
    duration_weeks: int = Field(default=4, ge=1, le=12)
    weak_areas: list[str] = Field(default_factory=list)


class RoadmapWeek(BaseModel):
    week: int
    theme: str
    topics: list[str]
    daily_tasks: list[str]
    resources: list[str]


class RoadmapResponse(BaseModel):
    target_role: str
    duration_weeks: int
    roadmap: list[RoadmapWeek]
    tips: list[str] = Field(default_factory=list)


# ─── RAG Schemas ───


class DocumentUploadResponse(BaseModel):
    filename: str
    category: str
    chunk_count: int
    message: str


class RAGSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    category: str | None = None
    top_k: int = Field(default=5, ge=1, le=20)


class RAGSearchResponse(BaseModel):
    answer: str
    sources: list[dict] = Field(default_factory=list)


# ─── Analytics Schemas ───


class AnalyticsResponse(BaseModel):
    total_interviews: int = 0
    average_score: float = 0.0
    topics_covered: list[str] = Field(default_factory=list)
    weak_areas: list[str] = Field(default_factory=list)
    strong_areas: list[str] = Field(default_factory=list)
    score_history: list[dict] = Field(default_factory=list)
    recent_activity: list[dict] = Field(default_factory=list)
