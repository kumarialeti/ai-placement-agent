# Architecture Documentation

## System Overview

The AI Placement Preparation Agent is a multi-agent system built on a modular, layered architecture. Each layer has a single responsibility and communicates through well-defined interfaces.

## Architecture Layers

### 1. API Layer (`app/api/`)
- **Router** (`router.py`): Central route aggregator under `/api/v1`
- **Routes**: Individual endpoint files per feature (chat, resume, jobs, interview, roadmap)
- **Auth**: JWT-based authentication with Bearer token scheme

### 2. Service Layer (`app/services/`)
- Business logic orchestration
- Bridges API endpoints with tools, agents, and data access
- Handles file uploads, session management, and analytics tracking

### 3. Agent Layer (`app/agents/`)
- **Manager Agent**: Routes queries to specialist agents
- **Specialist Agents**: Resume, Interview, DSA, ML, Job — each with dedicated tools
- Built using LangChain's `create_openai_tools_agent` + `AgentExecutor`

### 4. Graph Layer (`app/graph/`)
- **LangGraph StateGraph**: Production workflow engine
- **State**: TypedDict flowing through nodes
- **Nodes**: Intent detection → Specialized processing → Response
- **Edges**: Conditional routing based on detected intent

### 5. Tool Layer (`app/tools/`)
- LangChain `@tool` decorated functions
- Each tool wraps a specific capability (parse resume, match JD, generate questions, etc.)
- Structured outputs via Pydantic models

### 6. RAG Layer (`app/rag/`)
- **Loader**: PDF text extraction (PyMuPDF)
- **Chunking**: RecursiveCharacterTextSplitter
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector Store**: ChromaDB persistent client
- **Retriever**: Similarity search with metadata filtering

### 7. Memory Layer (`app/memory/`)
- **Short-term**: In-memory session buffers (conversation context)
- **Long-term**: SQLite-backed user profiles (skills, weak areas, scores)
- **MemoryManager**: Unified interface combining both

### 8. Evaluation Layer (`app/evaluation/`)
- **Answer Evaluator**: LLM-based multi-dimensional scoring
- **Rubrics**: Topic-specific scoring criteria and passing thresholds
- **Feedback Generator**: Detailed improvement suggestions

### 9. Analytics Layer (`app/analytics/`)
- **Tracker**: Event-based activity logging
- **Metrics**: Aggregate calculations (scores by topic, weak areas)
- **Reports**: Markdown progress reports

### 10. Data Layer (`app/database/`)
- **SQLAlchemy ORM**: Async engine with aiosqlite
- **Models**: User, Resume, InterviewSession, InterviewAnswer, ChatMessage, UserProfile, Document
- **CRUD**: Full create/read/update operations

## Data Flow

```
User Request
    ↓
FastAPI Router (auth validation)
    ↓
Service Layer (orchestration)
    ↓
LangGraph Workflow
    ↓
Intent Detection (LLM classification)
    ↓
Conditional Routing
    ↓
Specialist Node (Resume/Interview/RAG/etc.)
    ↓
Tool Execution (structured output)
    ↓
Memory Update (short + long term)
    ↓
Analytics Tracking
    ↓
Response to User
```

## Deployment Architecture

```
Client Browser
    ↓
Nginx (port 80/443)
    ├── Static files → React SPA
    └── /api/* → Backend (port 8000)
                    ├── SQLite (data/app.db)
                    ├── ChromaDB (vector_db/chroma/)
                    └── OpenAI API (external)
```
