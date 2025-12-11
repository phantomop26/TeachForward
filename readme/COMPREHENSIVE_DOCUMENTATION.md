# TeachForward - Comprehensive Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Design](#architecture--design)
4. [Database Schema](#database-schema)
5. [Authentication System](#authentication-system)
6. [Frontend Implementation](#frontend-implementation)
7. [Backend Implementation](#backend-implementation)
8. [AI Integration](#ai-integration)
9. [Feature Deep Dives](#feature-deep-dives)
10. [Deployment & DevOps](#deployment--devops)

---

## Project Overview

### Purpose
TeachForward is a comprehensive educational platform connecting students with tutors while providing AI-powered study tools, assignment management, grade tracking, and session scheduling.

### Target Users
- **Students:** Book tutoring sessions, submit assignments, track grades, use AI study tools
- **Tutors:** Manage sessions, assign homework, grade submissions, view student progress

### Key Features
1. **Dashboard:** Centralized overview of stats, sessions, assignments, calendar
2. **Sessions:** Book tutoring sessions, assign homework, view tutor subjects
3. **Homework:** Submit assignments, receive grades/feedback, file upload system
4. **Grades:** Track courses with weighted components, calculate GPA
5. **Study Tools:** AI flashcards, quizzes, summaries, PDF notes, personal notes

---

## Technology Stack

### Frontend
- **Framework:** React 19 with TypeScript
- **UI Library:** Material-UI (MUI) v7
- **Routing:** React Router v6
- **State Management:** React useState hooks (no Redux)
- **Date Handling:** Day.js
- **Calendar:** FullCalendar
- **Date Pickers:** MUI X Date Pickers
- **Build Tool:** Create React App
- **HTTP Client:** Fetch API

### Backend
- **Framework:** FastAPI 0.104.1 (Python 3.11)
- **ORM:** SQLAlchemy 2.0.22
- **Database:** SQLite (development) / PostgreSQL (production)
- **Authentication:** JWT with python-jose
- **Password Hashing:** bcrypt
- **File Handling:** Python built-in, PyPDF2 for PDFs
- **Validation:** Pydantic v2
- **CORS:** FastAPI middleware
- **API Documentation:** Swagger/OpenAPI (auto-generated)

### AI & External Services
- **AI Model:** OpenAI GPT-4o-mini
- **API Integration:** openai Python library
- **Use Cases:** Flashcards, quizzes, summaries, note extraction
- **Video Meetings:** Zoom API (Server-to-Server OAuth)
- **Zoom Integration:** PyJWT, requests library
- **Meeting Creation:** Automated Zoom link generation per session

### Development Tools
- **Version Control:** Git + GitHub
- **Environment Management:** Python venv
- **Environment Variables:** python-dotenv
- **Package Management:** npm (frontend), pip (backend)

### Deployment (Planned)
- **Platform:** Railway
- **Build:** Nixpacks
- **Database:** Railway PostgreSQL
- **Environment:** Production environment variables

---

## Architecture & Design

### System Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    Client Browser                         │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │           React Frontend (Port 3000)            │    │
│  │                                                 │    │
│  │  - Material-UI Components                      │    │
│  │  - React Router (SPA Navigation)               │    │
│  │  - localStorage (Custom events, notes)         │    │
│  │  - JWT Token Storage                           │    │
│  └─────────────────────────────────────────────────┘    │
└───────────────────────┬───────────────────────────────────┘
                        │
                        │ HTTP/HTTPS
                        │ REST API Calls
                        │ JWT Authorization
                        │
┌───────────────────────▼───────────────────────────────────┐
│               FastAPI Backend (Port 8000)                 │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  API Routers                                     │   │
│  │  - /auth (login, register, profile)             │   │
│  │  - /sessions (booking, tutors, assign homework) │   │
│  │  - /homework (submit, grade, files)             │   │
│  │  - /grades (courses, components, entries)       │   │
│  │  - /ai (flashcards, quizzes, summaries, PDF)    │   │
│  └──────────────────────────────────────────────────┘   │
│                        │                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Business Logic Layer                            │   │
│  │  - crud.py (Database operations)                 │   │
│  │  - schemas.py (Pydantic validation)              │   │
│  │  - deps.py (Dependency injection)                │   │
│  │  - files.py (File handling)                      │   │
│  └──────────────────────────────────────────────────┘   │
│                        │                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  SQLAlchemy ORM                                  │   │
│  │  - models.py (Database models)                   │   │
│  │  - database.py (Connection, session)             │   │
│  └──────────────────────────────────────────────────┘   │
└───────────────────────┬───────────────────────────────────┘
                        │
              ┌─────────┴──────────┐
              │                    │
              ▼                    ▼
    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │  SQLite/Postgres │  │   OpenAI API     │  │    Zoom API      │
    │    Database      │  │  (GPT-4o-mini)   │  │ (Video Meetings) │
    │                  │  │                  │  │                  │
    │  - users         │  │  - Flashcards    │  │  - OAuth Token   │
    │  - sessions      │  │  - Quizzes       │  │  - Create Meet   │
    │  - assignments   │  │  - Summaries     │  │  - Join URLs     │
    │  - courses       │  │  - PDF Extract   │  │  - Settings      │
    │  - submissions   │  │                  │  │                  │
    │  - grade_*       │  └──────────────────┘  └──────────────────┘
    │  - study_*       │
    └──────────────────┘
```

### Design Patterns

#### 1. **MVC-like Architecture**
- **Models:** SQLAlchemy models (models.py)
- **Views:** React components (pages/*)
- **Controllers:** FastAPI routers (routers/*)

#### 2. **Repository Pattern**
- **CRUD Module:** Centralized database operations
- **Abstraction:** Business logic separated from routes
- **Reusability:** Common operations shared across endpoints

#### 3. **Dependency Injection**
```python
# deps.py
def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Get authenticated user from JWT"""
    # Decode JWT, fetch user
    return user

# Usage in routers
@router.get("/profile")
def get_profile(current_user = Depends(get_current_user)):
    return current_user
```

#### 4. **Component-Based UI**
- Reusable React components
- **AIChatbot:** Global floating chat component
- **Header/Footer:** Layout components
- **Page Components:** Dashboard, Sessions, Homework, etc.

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │──────────┐
│ email       │          │
│ password    │          │ 1:N
│ full_name   │          │
│ role        │          │
│ subjects    │          ▼
│ bio         │     ┌──────────────┐
│ rating      │     │  Progress    │
└─────────────┘     │──────────────│
       │            │ id (PK)      │
       │            │ student_id   │
       │ 1:N        │ total_sessions│
       │            │ total_hours  │
       │            │ average_grade│
       │            └──────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Course   │   │ Session  │   │Assignment│   │StudySession│
│──────────│   │──────────│   │──────────│   │──────────│
│ id (PK)  │   │ id (PK)  │   │ id (PK)  │   │ id (PK)  │
│ student  │   │ student  │   │ tutor_id │   │ student  │
│ name     │   │ tutor    │   │ student  │   │ start    │
│ code     │   │ start    │   │ session  │   │ end      │
│ color    │   │ end      │   │ title    │   │ duration │
└──────────┘   │ topic    │   │ due_date │   └──────────┘
       │       │ status   │   └──────────┘
       │       │ zoom_link│        │
       │       └──────────┘        │ 1:N
       │                           │
       │ 1:N                       ▼
       │                    ┌──────────────┐
       ▼                    │ Submission   │
┌──────────────┐            │──────────────│
│GradeComponent│            │ id (PK)      │
│──────────────│            │ assignment   │
│ id (PK)      │            │ student_id   │
│ course_id    │            │ file_path    │
│ name         │            │ grade        │
│ weight       │            │ feedback     │
└──────────────┘            └──────────────┘
       │
       │ 1:N
       │
       ▼
┌──────────────┐
│ GradeEntry   │
│──────────────│
│ id (PK)      │
│ course_id    │
│ component_id │
│ name         │
│ score        │
│ max_score    │
│ date         │
│ notes        │
└──────────────┘
```

### Table Definitions

#### Core Tables

**users**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR UNIQUE NOT NULL,
  hashed_password VARCHAR NOT NULL,
  full_name VARCHAR,
  role VARCHAR DEFAULT 'student',  -- 'student' or 'tutor'
  bio TEXT,
  rating INTEGER,
  subjects VARCHAR,  -- Comma-separated for tutors
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**sessions** (SessionBooking model)
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES users(id) NOT NULL,
  tutor_id INTEGER REFERENCES users(id) NOT NULL,
  start DATETIME NOT NULL,
  end DATETIME NOT NULL,
  topic VARCHAR,
  status VARCHAR DEFAULT 'scheduled',
  zoom_link VARCHAR,  -- Real Zoom meeting URL via Zoom API
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**assignments**
```sql
CREATE TABLE assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tutor_id INTEGER REFERENCES users(id) NOT NULL,
  student_id INTEGER REFERENCES users(id),  -- NULL = all students
  session_id INTEGER REFERENCES sessions(id),  -- NULL = independent
  title VARCHAR NOT NULL,
  description TEXT,
  due_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**submissions**
```sql
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER REFERENCES assignments(id) NOT NULL,
  student_id INTEGER REFERENCES users(id) NOT NULL,
  file_path VARCHAR,
  grade VARCHAR,
  feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Grade Tracking Tables

**courses**
```sql
CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES users(id) NOT NULL,
  name VARCHAR NOT NULL,
  code VARCHAR,
  instructor VARCHAR,
  semester VARCHAR,
  color VARCHAR,  -- For UI visualization
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**grade_components**
```sql
CREATE TABLE grade_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER REFERENCES courses(id) NOT NULL,
  name VARCHAR NOT NULL,  -- e.g., "Assignments", "Midterm"
  weight FLOAT NOT NULL,  -- Percentage (0-100)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Cascade delete
  FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

**grade_entries**
```sql
CREATE TABLE grade_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER REFERENCES courses(id) NOT NULL,
  component_id INTEGER REFERENCES grade_components(id) NOT NULL,
  name VARCHAR NOT NULL,  -- e.g., "Assignment 1"
  score FLOAT NOT NULL,
  max_score FLOAT NOT NULL,
  date DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Cascade delete
  FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY(component_id) REFERENCES grade_components(id) ON DELETE CASCADE
);
```

#### Study Tracking Tables

**study_sessions**
```sql
CREATE TABLE study_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES users(id) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_minutes INTEGER,
  activity_type VARCHAR,  -- e.g., "studying", "tutoring"
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**progress**
```sql
CREATE TABLE progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES users(id) NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  total_hours INTEGER DEFAULT 0,
  average_grade INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Database Migrations

**Migration Strategy:**
- Manual migration scripts in `backend/migrations/`
- SQLAlchemy creates tables on first run
- ALTER TABLE scripts for schema changes

**Example Migration:**
```python
# backend/migrations/add_subjects_and_assignment_fields.py
from sqlalchemy import create_engine, text

engine = create_engine("sqlite:///./dev.db")

with engine.connect() as conn:
    # Add subjects to users
    conn.execute(text("ALTER TABLE users ADD COLUMN subjects TEXT"))
    
    # Add student_id to assignments
    conn.execute(text("ALTER TABLE assignments ADD COLUMN student_id INTEGER"))
    
    # Add session_id to assignments
    conn.execute(text("ALTER TABLE assignments ADD COLUMN session_id INTEGER"))
    
    conn.commit()
```

---

## Authentication System

### JWT-Based Authentication

#### Registration Flow

```
Student/Tutor Registration
         │
         ▼
Frontend: POST /auth/register
{
  "email": "user@example.com",
  "password": "securepass123",
  "full_name": "John Doe",
  "role": "student"
}
         │
         ▼
Backend: register()
  │
  ├─ Check if email exists
  │
  ├─ Truncate password to 72 chars (bcrypt limit)
  │
  ├─ Hash password with bcrypt
  │  password_hash = bcrypt.hashpw(password, bcrypt.gensalt())
  │
  ├─ Create User record
  │
  └─ Return UserOut (no password)
```

#### Login Flow

```
User Login
    │
    ▼
Frontend: POST /auth/login
{
  "email": "user@example.com",
  "password": "securepass123"
}
    │
    ▼
Backend: login()
  │
  ├─ Find user by email
  │
  ├─ Verify password
  │  bcrypt.checkpw(password, stored_hash)
  │
  ├─ Generate JWT token
  │  token = jwt.encode({
  │    "sub": str(user.id),
  │    "role": user.role,
  │    "exp": datetime.utcnow() + timedelta(hours=24)
  │  }, SECRET_KEY, algorithm="HS256")
  │
  └─ Return token
      │
      ▼
Frontend: Store token
  localStorage.setItem('access_token', token)
```

#### Protected Endpoint Access

```
API Request
    │
    ▼
Frontend: Adds Authorization header
  headers: {
    'Authorization': 'Bearer eyJhbG...'
  }
    │
    ▼
Backend: Dependency Injection
  def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
  ):
    │
    ├─ Decode JWT token
    │  payload = jwt.decode(token, SECRET_KEY)
    │
    ├─ Extract user_id from payload["sub"]
    │
    ├─ Query database for user
    │  user = db.query(User).get(user_id)
    │
    └─ Return user object
        │
        ▼
Endpoint: Use current_user
  @router.get("/profile")
  def profile(current_user = Depends(get_current_user)):
    return current_user
```

### Security Measures

1. **Password Hashing:** bcrypt with salt
2. **JWT Expiration:** 24 hours
3. **HTTPS Only:** In production
4. **CORS Configuration:** Specific origins only
5. **SQL Injection Prevention:** SQLAlchemy parameterized queries
6. **XSS Protection:** React auto-escapes variables
7. **CSRF:** Not needed for stateless JWT API

---

## Frontend Implementation

### Project Structure

```
frontend/teachforward-frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── App.tsx                 # Main app component, routing
│   ├── index.tsx               # Entry point
│   ├── App.css                 # Global styles
│   ├── components/
│   │   ├── Header/
│   │   │   └── Header.tsx      # Navigation, auth state
│   │   ├── Footer/
│   │   │   └── Footer.tsx
│   │   └── AIChatbot/
│   │       └── AIChatbot.tsx   # Floating chat widget
│   └── pages/
│       ├── Home/
│       │   └── Home.tsx        # Landing page
│       ├── Auth/
│       │   ├── Login.tsx
│       │   └── Register.tsx
│       ├── Dashboard/
│       │   └── Dashboard.tsx   # Stats, calendar, overview
│       ├── Sessions/
│       │   └── Sessions.tsx    # Book sessions, assign homework
│       ├── Homework/
│       │   └── Homework.tsx    # Submit, grade assignments
│       ├── Grades/
│       │   └── Grades.tsx      # Course grades, GPA
│       ├── StudyTools/
│       │   └── StudyTools.tsx  # AI tools, notes
│       ├── Profile/
│       │   └── Profile.tsx     # User profile
│       └── TutoringSession/
│           └── TutoringSession.tsx
├── package.json
└── tsconfig.json
```

### Routing Configuration

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/homework" element={<Homework />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/study-tools" element={<StudyTools />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
```

### State Management Approach

**No Global State Library:** Using React's built-in hooks

**Reasoning:**
- Application state is mostly page-specific
- Authentication state in localStorage
- API calls fetch fresh data on page load
- Reduces complexity and bundle size

**Shared State Pattern:**
```typescript
// Header.tsx - Auth state
const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  };
  
  checkAuth();
  
  // Listen for auth changes
  window.addEventListener('auth-change', checkAuth);
  
  return () => {
    window.removeEventListener('auth-change', checkAuth);
  };
}, []);

// Login.tsx - Trigger auth change
const handleLogin = async () => {
  // ... login logic
  localStorage.setItem('access_token', token);
  window.dispatchEvent(new Event('auth-change'));
};
```

### API Communication Pattern

```typescript
// Consistent API call pattern across all pages

const fetchData = async () => {
  try {
    const token = localStorage.getItem('access_token');
    
    const res = await fetch('http://localhost:8000/api/endpoint', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    
    if (!res.ok) {
      throw new Error('API call failed');
    }
    
    const data = await res.json();
    setData(data);
  } catch (err) {
    console.error('Error:', err);
    setError('Failed to fetch data');
  }
};
```

---

## Backend Implementation

### Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, startup
│   ├── database.py          # SQLAlchemy setup, session
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── crud.py              # Database operations
│   ├── deps.py              # Dependencies (auth, db)
│   ├── files.py             # File upload handling
│   └── routers/
│       ├── auth.py          # Login, register, profile
│       ├── sessions.py      # Session booking, homework
│       ├── homework.py      # Assignment submission, grading
│       ├── grades.py        # Grade tracking
│       ├── ai.py            # OpenAI integrations
│       └── ws.py            # WebSocket (future)
├── migrations/
│   └── *.py                 # Database migration scripts
├── uploads/                 # Submitted assignment files
├── requirements.txt
├── pytest.ini
├── .env
└── dev.db                   # SQLite database
```

### FastAPI Application Setup

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="TeachForward API",
    description="Educational platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from app.routers import auth, sessions, homework, grades, ai
app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(homework.router)
app.include_router(grades.router)
app.include_router(ai.router)

# Health check
@app.get("/health")
def health():
    return {"status": "ok"}
```

### Database Connection

```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./dev.db"  # Default for development
)

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)
```

### Model Example

```python
# app/models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="student")
    subjects = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    courses = relationship("Course", back_populates="student")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String)
    
    # Relationships
    student = relationship("User", back_populates="courses")
    grade_components = relationship(
        "GradeComponent",
        back_populates="course",
        cascade="all, delete-orphan"  # Delete components when course deleted
    )
```

### Schema Example

```python
# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str]
    role: Optional[str] = "student"

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    role: str
    subjects: Optional[str]
    
    class Config:
        orm_mode = True  # Allow ORM model conversion

class CourseCreate(BaseModel):
    name: str
    code: Optional[str]
    instructor: Optional[str]

class CourseOut(BaseModel):
    id: int
    student_id: int
    name: str
    code: Optional[str]
    
    class Config:
        orm_mode = True
```

### CRUD Example

```python
# app/crud.py
from sqlalchemy.orm import Session
from . import models, schemas
import bcrypt

def create_user(db: Session, user: schemas.UserCreate):
    # Hash password
    hashed_password = bcrypt.hashpw(
        user.password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')
    
    # Create user
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_sessions_for_student(db: Session, student_id: int):
    return db.query(models.SessionBooking)\
        .filter(models.SessionBooking.student_id == student_id)\
        .order_by(models.SessionBooking.start.desc())\
        .all()
```

---

## AI Integration

### OpenAI Configuration

```python
# app/routers/ai.py
import os
from openai import OpenAI
from fastapi import HTTPException

def get_openai_client():
    """
    Create OpenAI client with dynamic API key loading.
    Called at runtime to ensure .env is loaded.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured"
        )
    return OpenAI(api_key=api_key)
```

### Flashcard Generation

```python
@router.post("/generate-flashcards")
async def generate_flashcards(request: FlashcardRequest):
    client = get_openai_client()
    
    prompt = f"""Generate 10 educational flashcards from this text.
    Return ONLY valid JSON array with this exact structure:
    [
      {{"question": "Question text here", "answer": "Answer text here"}},
      ...
    ]
    
    Text: {request.text}"""
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=1500
    )
    
    content = response.choices[0].message.content
    
    # Handle markdown-wrapped JSON
    if content.startswith("```json"):
        content = content.replace("```json\n", "").replace("\n```", "")
    
    flashcards = json.loads(content)
    
    return {"flashcards": flashcards}
```

### Quiz Generation

```python
@router.post("/generate-quiz")
async def generate_quiz(request: QuizRequest):
    client = get_openai_client()
    
    prompt = f"""Generate 5 multiple choice questions from this text.
    Return ONLY valid JSON array:
    [
      {{
        "question": "Question text",
        "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
        "correct_answer": "A"
      }},
      ...
    ]
    
    Text: {request.text}"""
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=2000
    )
    
    content = response.choices[0].message.content
    
    if content.startswith("```json"):
        content = content.replace("```json\n", "").replace("\n```", "")
    
    questions = json.loads(content)
    
    return {"questions": questions}
```

### PDF Note Extraction

```python
from PyPDF2 import PdfReader
import io

@router.post("/parse-notes")
async def parse_notes(file: UploadFile = File(...)):
    # Read PDF
    pdf_content = await file.read()
    pdf_file = io.BytesIO(pdf_content)
    reader = PdfReader(pdf_file)
    
    # Extract text
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    
    # Limit text length (token limit)
    text = text[:4000]
    
    # Send to OpenAI
    client = get_openai_client()
    
    prompt = f"""Extract and organize study notes from this text.
    Create clear sections with headings and bullet points.
    Format as readable markdown.
    
    Text: {text}"""
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,  # More deterministic for notes
        max_tokens=1500
    )
    
    notes = response.choices[0].message.content
    
    return {"notes": notes}
```

### Cost Optimization

**Token Usage Tracking:**
```python
response = client.chat.completions.create(...)

# Log usage
usage = response.usage
print(f"Prompt tokens: {usage.prompt_tokens}")
print(f"Completion tokens: {usage.completion_tokens}")
print(f"Total tokens: {usage.total_tokens}")

# Calculate cost (GPT-4o-mini: $0.15/1M input, $0.60/1M output)
input_cost = (usage.prompt_tokens / 1_000_000) * 0.15
output_cost = (usage.completion_tokens / 1_000_000) * 0.60
total_cost = input_cost + output_cost
```

**Strategies:**
1. Truncate long inputs
2. Use lower temperature for deterministic tasks
3. Set max_tokens limits
4. Cache common responses
5. Use cheaper model (gpt-4o-mini vs gpt-4)

---

## Feature Deep Dives

### Dashboard: Average Grade Calculation

**Problem:** Original implementation pulled from `progress` table, always returned NULL

**Solution:** Calculate from actual grade data

```typescript
const calculateAverageGrade = () => {
  let totalGrade = 0;
  let courseCount = 0;
  
  courses.forEach(course => {
    const courseGrade = calculateCourseGrade(course);
    
    if (courseGrade !== null) {
      totalGrade += courseGrade;
      courseCount++;
    }
  });
  
  return courseCount > 0 
    ? (totalGrade / courseCount).toFixed(1) 
    : 'N/A';
};

const calculateCourseGrade = (course: Course): number | null => {
  if (!course.grade_components.length || !course.grade_entries.length) {
    return null;
  }
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  course.grade_components.forEach(component => {
    const entries = course.grade_entries.filter(
      e => e.component_id === component.id
    );
    
    if (entries.length > 0) {
      const componentAvg = entries.reduce((sum, entry) => 
        sum + (entry.score / entry.max_score), 0
      ) / entries.length;
      
      weightedSum += componentAvg * component.weight;
      totalWeight += component.weight;
    }
  });
  
  return totalWeight > 0 ? (weightedSum / totalWeight) * 100 : null;
};
```

### Sessions: Assignment Filtering

**Requirement:** Students should only see assignments assigned to them or general assignments

**Implementation:**

```python
@router.get("/assignments")
def list_assignments(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role == "tutor":
        # Tutors see all their created assignments
        return db.query(models.Assignment)\
            .filter(models.Assignment.tutor_id == current_user.id)\
            .all()
    else:
        # Students see:
        # 1. Assignments specifically assigned to them
        # 2. General assignments (student_id = NULL)
        return db.query(models.Assignment).filter(
            (models.Assignment.student_id == current_user.id) | 
            (models.Assignment.student_id == None)
        ).all()
```

### Homework: File Upload

**Challenge:** Handle multipart/form-data file uploads

**Frontend:**
```typescript
const handleSubmit = async () => {
  const formData = new FormData();
  formData.append('assignment_id', assignmentId.toString());
  formData.append('file', selectedFile);
  
  // Important: Don't set Content-Type header
  // Browser sets it automatically with boundary
  const res = await fetch('http://localhost:8000/homework/submit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // No Content-Type!
    },
    body: formData,
  });
};
```

**Backend:**
```python
@router.post("/submit")
def submit_assignment(
    assignment_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Save file
    file_path = save_upload_file(file)
    
    # Create submission
    submission = models.Submission(
        assignment_id=assignment_id,
        student_id=current_user.id,
        file_path=file_path
    )
    
    db.add(submission)
    db.commit()
    
    return {"submission_id": submission.id}

# files.py
def save_upload_file(upload_file: UploadFile) -> str:
    os.makedirs("uploads", exist_ok=True)
    
    filename = f"{datetime.now().timestamp()}_{upload_file.filename}"
    file_path = os.path.join("uploads", filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return file_path
```

### Grades: Weighted Average

**Formula:**
```
For each component:
  component_average = Σ(score/max_score) / count
  weighted_value = component_average × weight
  
course_grade = (Σ weighted_values / total_weight) × 100
```

**Example:**
- Assignments (30%): [85/100, 90/100, 88/100] → avg: 0.8767
- Midterm (30%): [78/100] → avg: 0.78
- Final (40%): [92/100] → avg: 0.92

```
weighted_sum = (0.8767 × 30) + (0.78 × 30) + (0.92 × 40)
             = 26.30 + 23.40 + 36.80
             = 86.50

course_grade = (86.50 / 100) × 100 = 86.50%
```

### Study Tools: localStorage vs Backend

**Decision Matrix:**

| Feature | Storage | Reasoning |
|---------|---------|-----------|
| AI Flashcards | Not stored | Generated on-demand, temporary |
| Manual Flashcards | localStorage | User-created, per-device |
| AI Quizzes | Not stored | Generated on-demand |
| Manual Quizzes | localStorage | User-created, per-device |
| Summaries | Not stored | Can regenerate |
| PDF Notes | Not stored | Can re-upload PDF |
| Personal Notes | localStorage | Complex hierarchy, frequent updates |
| Dashboard Events | localStorage | Per-device calendar customization |

**localStorage Advantages:**
- No backend changes
- Instant access
- Works offline
- Simple implementation

**localStorage Disadvantages:**
- Not synced across devices
- 5-10 MB limit
- User can clear it
- No backup

---

## Deployment & DevOps

### Local Development

**Start Script:**
```bash
#!/bin/bash
# local/start.sh

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000 &

# Frontend
cd ../frontend/teachforward-frontend
npm install
npm start &

echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
```

### Environment Variables

**.env (Backend):**
```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Database
DATABASE_URL=sqlite:///./dev.db

# Auth
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

**.gitignore:**
```
# Environment files
.env
.env.local
.env.*.local

# Database
*.db

# Uploads
uploads/

# Python
__pycache__/
*.pyc
venv/

# Node
node_modules/
build/
```

### Production Deployment (Railway)

**Backend Configuration (nixpacks.toml):**
```toml
[phases.setup]
nixPkgs = ["python311"]

[phases.install]
cmds = ["pip install -r requirements.txt"]

[phases.build]
cmds = []

[start]
cmd = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
```

**Frontend Configuration (nixpacks.toml):**
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npx serve -s build -l $PORT"
```

**Environment Variables (Railway):**
- OPENAI_API_KEY
- SECRET_KEY
- DATABASE_URL (PostgreSQL connection string)
- ALLOWED_ORIGINS (Frontend URL)

### Database Migration (SQLite → PostgreSQL)

```bash
# Export SQLite data
sqlite3 dev.db .dump > dump.sql

# Convert to PostgreSQL format
# Replace SQLite-specific syntax

# Import to PostgreSQL
psql $DATABASE_URL < dump.sql
```

---

## API Documentation

### Authentication Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| /auth/register | POST | Register new user | No |
| /auth/login | POST | Login, get JWT | No |
| /auth/me | GET | Get current user | Yes |
| /auth/update-profile | PUT | Update profile | Yes |

### Session Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| /sessions/tutors | GET | List tutors | No |
| /sessions/book | POST | Book session | Yes |
| /sessions/my-sessions | GET | Get user's sessions | Yes |
| /sessions/assign-homework | POST | Create assignment (tutor) | Yes |
| /sessions/my-students | GET | Get tutor's students | Yes |

### Homework Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| /homework/assignments | GET | List assignments | Yes |
| /homework/submit | POST | Submit assignment | Yes |
| /homework/my-submissions | GET | Get submissions | Yes |
| /homework/grade | POST | Grade submission (tutor) | Yes |
| /homework/file | GET | Download file | Yes |

### Grades Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| /grades/courses | GET/POST | List/create courses | Yes |
| /grades/courses/{id} | DELETE | Delete course | Yes |
| /grades/components | POST | Create component | Yes |
| /grades/components/{id} | DELETE | Delete component | Yes |
| /grades/entries | POST | Create entry | Yes |
| /grades/entries/{id} | DELETE | Delete entry | Yes |
| /grades/study-hours | GET | Get study hours | Yes |

### AI Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| /ai/generate-flashcards | POST | Generate flashcards | Yes |
| /ai/generate-quiz | POST | Generate quiz | Yes |
| /ai/summarize | POST | Summarize text | Yes |
| /ai/parse-notes | POST | Extract PDF notes | Yes |
| /ai/chat | POST | AI chat | Yes |

---

## Testing & Quality Assurance

### Manual Testing Checklist

**Authentication:**
- [ ] Register with valid email
- [ ] Login with correct credentials
- [ ] Login fails with wrong password
- [ ] Protected routes require authentication
- [ ] Logout clears token

**Dashboard:**
- [ ] Stats display correct numbers
- [ ] Sessions list populated
- [ ] Assignments list populated
- [ ] Calendar shows events
- [ ] Custom events can be added/deleted

**Sessions:**
- [ ] Tutors list displays with subjects
- [ ] Students can book sessions
- [ ] Tutors can assign homework
- [ ] Session cards show correct info
- [ ] Status colors correct

**Homework:**
- [ ] Assignments display correctly
- [ ] File upload works
- [ ] Submissions saved
- [ ] Tutors can grade
- [ ] Students see grades/feedback
- [ ] File download works

**Grades:**
- [ ] Courses can be created/deleted
- [ ] Components can be added
- [ ] Entries can be added
- [ ] Weighted average correct
- [ ] GPA calculation correct
- [ ] Study hours display

**Study Tools:**
- [ ] Flashcards generate from text
- [ ] Manual flashcards saved
- [ ] Quizzes generate correctly
- [ ] Summaries created
- [ ] PDF upload and extraction works
- [ ] Personal notes hierarchy works

---

## Performance & Optimization

### Frontend Optimization

1. **Code Splitting:** React Router lazy loading (potential)
2. **Memoization:** useMemo for expensive calculations
3. **Debouncing:** Calendar interactions
4. **Conditional Rendering:** Only render what's needed

### Backend Optimization

1. **Query Optimization:** Eager loading relationships
2. **Indexing:** Database indexes on foreign keys
3. **Connection Pooling:** SQLAlchemy session management
4. **Caching:** (Future) Redis for frequent queries

### Database Optimization

```python
# Good - One query with join
courses = db.query(models.Course)\
    .options(
        joinedload(models.Course.grade_components),
        joinedload(models.Course.grade_entries)
    )\
    .filter(models.Course.student_id == student_id)\
    .all()

# Bad - N+1 queries
courses = db.query(models.Course).filter(...).all()
for course in courses:
    components = course.grade_components  # Separate query each time
```

---

## Future Enhancements

### Short Term
1. Real-time notifications (WebSocket)
2. Email notifications (SendGrid)
3. Profile picture uploads
4. Search functionality
5. Mobile responsive improvements

### Medium Term
1. Payment processing (Stripe)
2. Advanced analytics dashboard
3. Recommendation system
4. Mobile app (React Native)
5. In-browser video calls (Twilio, WebRTC)

### Long Term
1. Machine learning grade predictions
2. Adaptive learning paths
3. Gamification system
4. Multi-language support
5. White-label solution for institutions

---

## Complete Backend API Reference

### Quick Reference: All Endpoints by Module

**Authentication (`/auth`)** - 6 endpoints
- POST `/auth/register` - User registration
- POST `/auth/login` - User login (returns JWT)
- GET `/auth/me` - Get current user profile
- PUT `/auth/update-profile` - Update user profile
- POST `/auth/reset-password-request` - Request password reset
- POST `/auth/reset-password` - Reset password with token

**Sessions (`/sessions`)** - 8 endpoints
- GET `/sessions/tutors` - Get available tutors
- POST `/sessions/book` - Book tutoring session
- GET `/sessions/my-sessions` - Get user's sessions
- PUT `/sessions/{id}/status` - Update session status
- POST `/sessions/assign-homework` - Assign homework from session
- GET `/sessions/my-students` - Get students with booked sessions
- GET `/sessions/all-students` - Get all registered students
- DELETE `/sessions/{id}` - Delete session

**Homework (`/homework`)** - 7 endpoints
- POST `/homework/create` - Create assignment
- GET `/homework/assignments` - Get assigned homework
- POST `/homework/submit` - Submit assignment (multipart/form-data)
- GET `/homework/my-submissions` - Get own submissions
- GET `/homework/submissions` - Get all submissions (tutor)
- POST `/homework/grade` - Grade submission
- GET `/homework/file` - Download submission file

**Grades (`/grades`)** - 13 endpoints
- POST `/grades/courses` - Create course
- GET `/grades/courses` - Get all courses
- GET `/grades/courses/{id}` - Get specific course
- DELETE `/grades/courses/{id}` - Delete course
- POST `/grades/courses/{id}/components` - Add grade component
- DELETE `/grades/components/{id}` - Delete component
- POST `/grades/courses/{id}/entries` - Add grade entry
- DELETE `/grades/entries/{id}` - Delete entry
- GET `/grades/courses/{id}/grade` - Calculate course grade
- POST `/grades/study-session/start` - Start study timer
- POST `/grades/study-session/end` - End study timer
- GET `/grades/study-session/active` - Get active session
- GET `/grades/study-hours` - Get total study time

**AI Tools (`/ai`)** - 9 endpoints
- POST `/ai/summarize` - Summarize text
- POST `/ai/flashcards` - Generate flashcards
- POST `/ai/quiz` - Generate quiz
- POST `/ai/concept-map` - Create concept map
- POST `/ai/generate-flashcards` - AI flashcards from notes
- POST `/ai/generate-quiz` - AI quiz from notes
- POST `/ai/chat` - Study assistant chatbot
- POST `/ai/parse-notes` - Parse notes structure
- POST `/ai/extract-pdf` - Extract PDF text

**Feedback (`/feedback`)** - 2 endpoints
- POST `/feedback/create` - Submit feedback for tutor
- GET `/feedback/tutor/{id}` - Get tutor's feedback

**Progress (`/progress`)** - 2 endpoints
- GET `/progress/me` - Get own progress
- GET `/progress/student/{id}` - Get student progress (tutor)

**Profile (`/profile`)** - 2 endpoints
- GET `/profile/{user_id}` - Get user profile
- PUT `/profile/update` - Update profile settings

**WebSocket (`/ws`)** - 1 endpoint
- WS `/ws` - Real-time communication

**Total: 51 API endpoints**

### Authentication Flow
```
1. Register: POST /auth/register → {user_data}
2. Login: POST /auth/login → {access_token}
3. Use Token: Headers: Authorization: Bearer <token>
4. All subsequent requests require this header
```

### Common Response Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `422 Unprocessable Entity` - Validation error

For detailed request/response examples, see individual module documentation:
- [SESSIONS.md](SESSIONS.md) - Session management API
- [HOMEWORK.md](HOMEWORK.md) - Homework API
- [GRADES.md](GRADES.md) - Grade tracking API
- [STUDYTOOLS.md](STUDYTOOLS.md) - AI tools API
- [DASHBOARD.md](DASHBOARD.md) - Dashboard data sources

---

## Conclusion

TeachForward is a full-stack educational platform built with modern technologies, featuring:

- **Robust Backend:** FastAPI with SQLAlchemy, JWT authentication
- **Interactive Frontend:** React with Material-UI, TypeScript
- **AI Integration:** OpenAI GPT-4o-mini for educational tools
- **Comprehensive Features:** Sessions, homework, grades, study tools
- **Scalable Architecture:** Ready for production deployment

The platform demonstrates proficiency in:
- Full-stack development
- Database design and relationships
- API design and implementation
- Authentication and security
- AI/ML integration
- Modern frontend frameworks
- Cloud deployment readiness

**Total Development Time:** ~3 months
**Lines of Code:** ~15,000+
**Technologies Used:** 20+
**Features Implemented:** 50+
