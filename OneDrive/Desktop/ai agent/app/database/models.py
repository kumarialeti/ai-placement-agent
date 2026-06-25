"""
SQLAlchemy ORM models for the application.
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    """Base class for all models."""
    pass


class User(Base):
    """User model for authentication and profile."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    interview_sessions = relationship(
        "InterviewSession", back_populates="user", cascade="all, delete-orphan"
    )
    chat_messages = relationship(
        "ChatMessage", back_populates="user", cascade="all, delete-orphan"
    )
    user_profile = relationship(
        "UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class Resume(Base):
    """Uploaded resume storage and analysis results."""

    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    raw_text = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)  # JSON string of skills list
    strengths = Column(Text, nullable=True)  # JSON string
    weaknesses = Column(Text, nullable=True)  # JSON string
    ats_score = Column(Float, nullable=True)
    analysis_result = Column(Text, nullable=True)  # Full JSON analysis
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")


class InterviewSession(Base):
    """Mock interview sessions."""

    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(100), nullable=False)
    difficulty = Column(String(50), nullable=False, default="intermediate")
    total_questions = Column(Integer, default=0)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)  # JSON string
    status = Column(String(50), default="in_progress")  # in_progress, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="interview_sessions")
    answers = relationship(
        "InterviewAnswer", back_populates="session", cascade="all, delete-orphan"
    )


class InterviewAnswer(Base):
    """Individual answers within a mock interview session."""

    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    question = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=True)
    ideal_answer = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("InterviewSession", back_populates="answers")


class ChatMessage(Base):
    """Chat history for conversations."""

    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(50), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    intent = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")


class UserProfile(Base):
    """Long-term user profile for personalization."""

    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    known_skills = Column(Text, nullable=True)  # JSON list
    weak_areas = Column(Text, nullable=True)  # JSON list
    strong_areas = Column(Text, nullable=True)  # JSON list
    target_role = Column(String(200), nullable=True)
    experience_level = Column(String(50), nullable=True)  # fresher, 1-2yrs, 3-5yrs
    total_mock_interviews = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    last_active = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="user_profile")


class Document(Base):
    """Uploaded documents for RAG knowledge base."""

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    category = Column(String(100), nullable=False)  # dsa, ml, interview, aptitude
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
