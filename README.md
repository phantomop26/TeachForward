# TeachForward - AI-Powered Learning Platform

A comprehensive educational platform combining tutoring, homework management, AI-powered study tools, and grade tracking.

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- OpenAI API key

### Setup & Run

1. **Clone the repository**
```bash
git clone <repository-url>
cd senior-design
```

2. **Configure Backend**
```bash
cd backend
# Create .env file with your OpenAI API key
echo "OPENAI_API_KEY=sk-your-key-here" > .env
echo "DATABASE_URL=sqlite:////$(pwd)/dev.db" >> .env
echo "SECRET_KEY=your-secret-key-for-jwt-tokens" >> .env
cd ..
```

3. **Install Dependencies & Start**
```bash
./local/start.sh
```

This will:
- Install Python dependencies
- Install Node dependencies  
- Start backend on http://localhost:8000
- Start frontend on http://localhost:3000
- API docs available at http://localhost:8000/docs

4. **Stop Application**
```bash
./local/stop.sh
```

## 📁 Project Structure

```
senior-design/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # Entry point
│   │   ├── models.py    # Database models
│   │   ├── schemas.py   # API schemas
│   │   └── routers/     # API endpoints
│   │       ├── auth.py       # Authentication
│   │       ├── sessions.py   # Tutoring sessions
│   │       ├── homework.py   # Assignments
│   │       ├── ai.py         # AI features
│   │       └── grades.py     # Grade tracking
│   ├── requirements.txt
│   ├── railway.toml     # Railway deployment config
│   └── .env            # Environment variables
├── frontend/
│   └── teachforward-frontend/  # React app
│       ├── src/
│       │   ├── pages/        # Main pages
│       │   └── components/   # Reusable components
│       ├── package.json
│       └── railway.toml      # Railway deployment config
├── local/              # Local development scripts
│   ├── start.sh        # Start both services locally
│   └── stop.sh         # Stop services
├── uploads/            # File storage
├── logs/              # Application logs
└── README.md
```

## ✨ Features

### 📊 Dashboard
- Session overview and upcoming schedule
- Assignment tracker with due dates
- Grade statistics (GPA & average)
- Study hours tracking
- **Interactive calendar** with auto-populated sessions, assignments, and custom events

### 👨‍🏫 Tutoring Sessions
- Book one-on-one tutoring sessions
- Video call integration
- Session history and notes
- Topic-based scheduling

### 📝 Homework Management
- Assignment submission
- Grading system
- File uploads (PDFs, images, documents)
- Due date tracking

### 🤖 AI Study Tools

**AI-Generated Content:**
- **Flashcards**: Generate study flashcards from any topic
- **Quizzes**: Create practice quizzes with multiple choice questions
- **Summaries**: Summarize lecture notes or textbook chapters
- **Smart Notes**: Upload PDFs → AI extracts text → Generates structured notes with explanations

**Manual Creation:**
- **Custom Flashcards**: Create your own flashcards
- **Custom Quizzes**: Build quizzes manually
- **Personal Notes**: Manual note-taking with sections and nested subsections

### 📚 Grade Tracking
- **Course Management**: Track multiple courses with details
- **Weighted Components**: Define grade categories (Homework 40%, Exams 60%, etc.)
- **Grade Entries**: Individual assignments with scores
- **Automatic Calculations**: Weighted averages, GPA (4.0 scale), letter grades
- **Study Time Tracker**: Automatic session timing

### 📅 Calendar System
- **Auto-populated**: Sessions and assignments appear automatically
- **Custom Events**: Add study sessions, exams, meetings, etc.
- **Color-coded**: Different types (sessions, assignments, events)
- **Persistent Storage**: Custom events saved to localStorage
- **Event Management**: Add, view, delete events

### 💬 AI Chat Assistant
- Available on every page (floating button)
- Context-aware help
- Powered by GPT-4

## 🔑 Environment Variables

Create `backend/.env`:

```env
OPENAI_API_KEY=sk-your-openai-api-key
DATABASE_URL=sqlite:////absolute/path/to/senior-design/backend/dev.db
SECRET_KEY=your-secret-key-for-jwt-authentication
```

## 🧪 Testing

**Backend:**
```bash
cd backend
pytest
```

**Frontend:**
```bash
cd frontend/teachforward-frontend
npm test
npm run build  # Production build
```

## 🌐 Deployment Options

### Option 1: Traditional Hosting

**Backend (Railway, Render, or DigitalOcean):**
1. Push to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy from `backend/` directory
5. Use PostgreSQL for production database

**Frontend (Vercel or Netlify):**
```bash
cd frontend/teachforward-frontend
vercel  # or netlify deploy
```

### Option 2: Docker (Recommended for Production)

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=postgresql://user:pass@db:5432/teachforward
    depends_on:
      - db
      
  frontend:
    build: ./frontend/teachforward-frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
      
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: teachforward
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🛠️ Technology Stack

**Backend:**
- FastAPI - Modern Python web framework
- SQLAlchemy - SQL toolkit and ORM
- SQLite/PostgreSQL - Database
- OpenAI GPT-4o-mini - AI features
- JWT - Authentication
- Python 3.11+

**Frontend:**
- React 19 - UI library
- TypeScript - Type safety
- Material-UI v7 - Component library
- React Router - Navigation

## 📝 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints:

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/token` - Login (get JWT token)
- `GET /auth/me` - Get current user

**Sessions:**
- `GET /sessions/` - List sessions
- `POST /sessions/` - Create session

**Homework:**
- `GET /homework/assignments` - List assignments
- `POST /homework/submit` - Submit assignment

**AI Tools:**
- `POST /ai/generate-flashcards` - Generate flashcards
- `POST /ai/generate-quiz` - Generate quiz
- `POST /ai/summarize` - Summarize content
- `POST /ai/chat` - AI chat

**Grades:**
- `POST /grades/courses` - Create course
- `POST /grades/courses/{id}/components` - Add grade component
- `POST /grades/courses/{id}/entries` - Add grade entry
- `GET /grades/courses/{id}/grade` - Get weighted grade

## 👥 Getting Started

1. **Register an account** at http://localhost:3000/register
2. **Login** with your credentials
3. **Explore features:**
   - Add a course in Grades
   - Create flashcards in Study Tools
   - Add an event to your calendar
   - Chat with the AI assistant

## 🐛 Troubleshooting

**Backend won't start:**
```bash
# Check if port is in use
lsof -i:8000
# Kill process
kill -9 <PID>

# Check logs
cat logs/backend.log

# Verify Python version
python3 --version  # Should be 3.8+
```

**Frontend won't start:**
```bash
# Check port
lsof -i:3000

# Clean install
cd frontend/teachforward-frontend
rm -rf node_modules package-lock.json
npm install

# Check logs
cat logs/frontend.log
```

**Database issues:**
```bash
# Reset database
rm backend/dev.db
# Restart backend to recreate
```

**OpenAI API errors:**
- Verify API key in `backend/.env`
- Check API usage limits
- Ensure key starts with `sk-`

## 📦 File Structure Details

**Important Files:**
- `backend/app/main.py` - FastAPI app initialization
- `backend/app/database.py` - Database connection
- `backend/app/models.py` - Database schemas
- `frontend/src/App.tsx` - React app entry
- `frontend/src/pages/` - All page components

**Config Files:**
- `backend/requirements.txt` - Python dependencies
- `frontend/package.json` - Node dependencies
- `backend/.env` - Environment variables
- `vercel.json` - Vercel deployment config

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📧 Support

For issues and questions:
- Open a GitHub issue
- Check existing documentation
- Review API docs at `/docs`

---

**Built with ❤️ for better learning**
