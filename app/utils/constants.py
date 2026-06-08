"""
Application-wide constants.
"""

# ─── Model Defaults ───
DEFAULT_TEMPERATURE = 0.7
MAX_TOKENS = 4096

# ─── RAG Defaults ───
DEFAULT_CHUNK_SIZE = 1000
DEFAULT_CHUNK_OVERLAP = 200
DEFAULT_TOP_K = 5

# ─── Supported File Types ───
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}

# ─── Interview Difficulty Levels ───
DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"]

# ─── Topic Categories ───
TOPIC_CATEGORIES = [
    "dsa",
    "python",
    "ml",
    "nlp",
    "deep_learning",
    "transformers",
    "llms",
    "system_design",
    "dbms",
    "os",
    "cn",
    "hr",
    "aptitude",
]

# ─── Agent Names ───
AGENT_NAMES = {
    "manager": "Manager Agent",
    "resume": "Resume Analysis Agent",
    "interview": "Interview Preparation Agent",
    "dsa": "DSA & Problem Solving Agent",
    "ml": "ML/NLP Specialist Agent",
    "job": "Job Description Agent",
}

# ─── Intent Types ───
INTENT_TYPES = [
    "resume_analysis",
    "job_matching",
    "interview_questions",
    "mock_interview",
    "rag_search",
    "study_roadmap",
    "general_chat",
]

# ─── Scoring ───
MAX_ATS_SCORE = 100
MAX_MATCH_SCORE = 100
MAX_ANSWER_SCORE = 10
