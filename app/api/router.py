"""
Main API router aggregating all route modules.
"""

from fastapi import APIRouter

from app.api.routes import chat, interview, jobs, resume, roadmap, recruiter
from app.auth.auth_routes import router as auth_router

api_router = APIRouter(prefix="/api/v1")

# Include all route modules
api_router.include_router(auth_router)
api_router.include_router(chat.router)
api_router.include_router(resume.router)
api_router.include_router(jobs.router)
api_router.include_router(interview.router)
api_router.include_router(roadmap.router)
api_router.include_router(recruiter.router)
