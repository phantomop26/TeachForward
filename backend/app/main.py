from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .database import engine
from . import models
from .routers import auth, sessions, ai, homework, ws, feedback, progress, profile, grades

# Load environment variables from .env file
load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TeachForward API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(ai.router)
app.include_router(homework.router)
app.include_router(feedback.router)
app.include_router(progress.router)
app.include_router(profile.router)
app.include_router(ws.router)
app.include_router(grades.router)

@app.get("/health")
def health():
    return {"status": "ok"}
