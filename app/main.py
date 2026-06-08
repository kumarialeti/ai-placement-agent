"""
FastAPI Application Entry Point.
AI Placement Preparation Agent — Production-grade GenAI Backend.
"""

import sys
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.database.connection import close_db, init_db
from app.utils.config import get_settings
from app.utils.helpers import ensure_directory
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events."""
    # ─── Startup ───
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # Create required directories
    ensure_directory("./data")
    ensure_directory("./data/uploads")
    ensure_directory("./data/uploads/resumes")
    ensure_directory("./data/uploads/job_descriptions")
    ensure_directory("./vector_db")

    # Initialize database
    await init_db()
    logger.info("✅ Database initialized")

    yield

    # ─── Shutdown ───
    await close_db()
    logger.info("👋 Application shut down gracefully")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    🎯 AI-powered Placement Preparation Agent

    Features:
    - 📄 Resume Analysis with ATS Scoring
    - 💼 Job Description Matching
    - ❓ Interview Question Generation
    - 🎤 Mock Interview with AI Evaluation
    - 📚 RAG-based Knowledge Search
    - 🗺️ Personalized Study Roadmaps
    - 📊 Progress Analytics & Tracking
    - 🤖 Multi-Agent Architecture with LangGraph

    Built with: FastAPI, LangChain, LangGraph, ChromaDB, OpenAI
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)


# Health check
@app.get("/", tags=["Health"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again."},
    )
