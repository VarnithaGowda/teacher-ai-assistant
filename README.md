# 🎓 AI-Powered Teacher Lesson Planner & Evaluation Assistant

A full-stack EdTech platform that helps teachers automate lesson planning, rubric generation, assignment creation, student answer evaluation, and performance feedback using Generative AI and RAG pipelines.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, React Router, Axios |
| Backend | FastAPI, Python 3.11+ |
| AI/LLM | Google Gemini 1.5 Flash, LangChain, LangGraph |
| Embeddings | HuggingFace sentence-transformers/all-MiniLM-L6-v2 |
| Vector DB | ChromaDB |
| Database | MongoDB (Motor async driver) |
| Auth | JWT (python-jose) |
| File Parsing | PyMuPDF, python-docx |

## 📁 Project Structure

```
teacher-ai-platform/
├── frontend/                  # React + Tailwind frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── context/           # React context (auth, etc.)
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API service layer
│   │   └── utils/             # Utility functions
│   └── public/
├── backend/                   # FastAPI backend
│   ├── api/                   # Route handlers
│   ├── auth/                  # JWT authentication
│   ├── database/              # MongoDB connection & models
│   ├── models/                # Pydantic schemas
│   ├── ai_services/           # AI service layer
│   ├── workflows/             # LangGraph workflows
│   ├── prompts/               # Prompt templates
│   ├── vector_store/          # ChromaDB integration
│   └── utils/                 # File parsing, helpers
└── docs/                      # API documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Fill in your values
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

Visit: http://localhost:5173

## 📡 API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🌐 Deployment

- **Frontend** → Vercel (`npm run build`, deploy `dist/`)
- **Backend** → Render/Railway (start: `uvicorn main:app --host 0.0.0.0 --port $PORT`)

## ✨ Features

1. AI Lesson Plan Generator
2. AI Rubric Generator
3. AI Student Evaluator
4. Teacher AI Chatbot (RAG-powered)
5. LangGraph Workflow: Syllabus → Topics → Lesson Plan → Rubric → Assignment
6. Analytics Dashboard

## 📄 License

MIT
