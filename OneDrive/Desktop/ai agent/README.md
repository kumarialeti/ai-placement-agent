# 🎯 AI Placement Preparation Agent

> An end-to-end, production-grade AI agent for placement preparation — built with RAG, LangChain, LangGraph, Multi-Agent Architecture, FastAPI, and Docker.

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![LangChain](https://img.shields.io/badge/LangChain-0.3-green)
![LangGraph](https://img.shields.io/badge/LangGraph-0.2-purple)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Resume Analysis** | Upload PDF, extract skills, get ATS score, identify strengths/weaknesses |
| 💼 **JD Matching** | Compare resume against job descriptions with match score |
| ❓ **Interview Questions** | Generate topic-specific questions at beginner/intermediate/advanced levels |
| 🎤 **Mock Interview** | Practice with AI evaluation, scoring, and detailed feedback |
| 📚 **RAG Knowledge Base** | Upload study materials, search with semantic similarity |
| 🗺️ **Study Roadmap** | Personalized week-by-week study plans based on weak areas |
| 📊 **Analytics Dashboard** | Track progress, scores, weak areas over time |
| 🧠 **Memory System** | Short-term (session) + Long-term (persistent) memory |
| 🤖 **Multi-Agent Architecture** | Manager + 5 specialist agents with tool calling |
| 🔐 **JWT Authentication** | Secure user registration, login, and profile management |

---

## 🏗️ Architecture

```
Frontend (React) → FastAPI → LangGraph Workflow
                                    ↓
                            Intent Detection
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
              Resume Agent    Interview Agent    ML Agent
                    ↓               ↓               ↓
              ┌─────┴─────┐   ┌────┴────┐    ┌────┴────┐
              ↓           ↓   ↓         ↓    ↓         ↓
          Parser Tool  JD Tool  Q-Gen   RAG  Search   Eval
                                         ↓
                                    ChromaDB → OpenAI
```

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Python 3.10+ |
| LLM Orchestration | LangChain, LangGraph |
| LLM Provider | Groq (Llama-3.1) |
| Vector Database | ChromaDB |
| Embeddings | Hugging Face Embeddings |
| Database | SQLite + SQLAlchemy (async) |
| Auth | JWT (python-jose + bcrypt) |
| PDF Processing | PyMuPDF |
| Frontend | React + Vite |
| Deployment | Docker + docker-compose |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+ (for frontend)
- Groq API key

### 1. Clone & Setup

```bash
git clone <repo-url>
cd ai-placement-agent

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: .\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 3. Run Backend

```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Access

- **API Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:5173

---

## 🐳 Docker

```bash
cd deployment
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Get profile |
| POST | `/api/v1/chat/send` | Send message to agent |
| GET | `/api/v1/chat/history` | Get chat history |
| POST | `/api/v1/resume/upload` | Upload resume PDF |
| GET | `/api/v1/resume/list` | List resumes |
| POST | `/api/v1/jobs/match` | Match resume vs JD |
| POST | `/api/v1/interview/start` | Start mock interview |
| POST | `/api/v1/interview/answer` | Submit answer |
| POST | `/api/v1/interview/complete/{id}` | Complete session |
| GET | `/api/v1/interview/history` | Interview history |
| POST | `/api/v1/roadmap/generate` | Generate study plan |
| GET | `/api/v1/roadmap/progress` | Get progress report |

---

## 🧪 Testing

```bash
pytest tests/ -v
```

---

## 📂 Project Structure

```
ai-placement-agent/
├── app/
│   ├── api/              # FastAPI routes
│   ├── agents/           # Multi-agent system
│   ├── auth/             # JWT authentication
│   ├── analytics/        # Progress tracking
│   ├── database/         # SQLAlchemy models & CRUD
│   ├── evaluation/       # Answer scoring
│   ├── graph/            # LangGraph workflow
│   ├── llm/              # LLM client & prompts
│   ├── memory/           # Short & long-term memory
│   ├── rag/              # RAG pipeline
│   ├── services/         # Business logic
│   ├── tools/            # LangChain tools
│   ├── utils/            # Config, logger, constants
│   └── main.py           # FastAPI entry point
├── deployment/           # Docker & nginx
├── frontend/             # React UI
├── tests/                # pytest tests
└── docs/                 # Documentation
```

---

## 🛡️ Technologies Covered

✅ Python · ✅ NLP · ✅ Transformers · ✅ LLMs · ✅ Embeddings · ✅ Vector DB · ✅ RAG · ✅ LangChain · ✅ Tool Calling · ✅ Agents · ✅ LangGraph · ✅ Memory · ✅ Multi-Agent · ✅ FastAPI · ✅ Docker · ✅ Deployment · ✅ Authentication · ✅ Evaluation · ✅ Analytics

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.
