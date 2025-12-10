from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
from passlib.context import CryptContext
from typing import Optional, List
from datetime import datetime
import warnings

# Suppress bcrypt version warning
warnings.filterwarnings("ignore", message=".*bcrypt.*")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    try:
        # Aggressively truncate password to 72 characters (bcrypt hard limit)
        # Use character limit, not byte limit, to be extra safe
        if len(password) > 72:
            password = password[:72]
        return pwd_context.hash(password)
    except Exception as e:
        print(f"Password hashing error: {str(e)}, password length: {len(password)}")
        raise ValueError(f"Failed to hash password: {str(e)}")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        # Truncate password to 72 characters for verification
        if len(plain) > 72:
            plain = plain[:72]
        return pwd_context.verify(plain, hashed)
    except Exception as e:
        print(f"Password verification error: {str(e)}")
        return False

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(email=user.email, hashed_password=get_password_hash(user.password), full_name=user.full_name, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).get(user_id)

def update_user(db: Session, user_id: int, full_name: Optional[str] = None, bio: Optional[str] = None):
    user = db.query(models.User).get(user_id)
    if user:
        if full_name is not None:
            user.full_name = full_name
        if bio is not None:
            user.bio = bio
        db.commit()
        db.refresh(user)
    return user

def create_session(db: Session, student_id: int, session_in: schemas.SessionCreate):
    # Generate a simple Zoom-style meeting link (in production, you'd use Zoom API)
    import random
    import string
    meeting_id = ''.join(random.choices(string.digits, k=11))
    zoom_link = f"https://zoom.us/j/{meeting_id}"
    
    s = models.SessionBooking(
        student_id=student_id,
        tutor_id=session_in.tutor_id,
        start=session_in.start,
        end=session_in.end,
        topic=session_in.topic,
        zoom_link=zoom_link
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return s

def get_sessions_for_student(db: Session, student_id: int):
    return db.query(models.SessionBooking).filter(models.SessionBooking.student_id == student_id).all()

def get_sessions_for_tutor(db: Session, tutor_id: int):
    return db.query(models.SessionBooking).filter(models.SessionBooking.tutor_id == tutor_id).all()

def update_session_status(db: Session, session_id: int, status: str):
    session = db.query(models.SessionBooking).get(session_id)
    if session:
        session.status = status
        db.commit()
        db.refresh(session)
    return session

def list_tutors(db: Session):
    return db.query(models.User).filter(models.User.role == "tutor").all()

def create_feedback(db: Session, session_id: int, student_id: int, tutor_id: int, rating: int, comment: Optional[str] = None):
    fb = models.Feedback(session_id=session_id, student_id=student_id, tutor_id=tutor_id, rating=rating, comment=comment)
    db.add(fb)
    db.commit()
    
    avg_rating = db.query(func.avg(models.Feedback.rating)).filter(models.Feedback.tutor_id == tutor_id).scalar()
    tutor = db.query(models.User).get(tutor_id)
    if tutor and avg_rating:
        tutor.rating = int(avg_rating)
        db.commit()
    
    db.refresh(fb)
    return fb

def get_feedback_for_tutor(db: Session, tutor_id: int):
    return db.query(models.Feedback).filter(models.Feedback.tutor_id == tutor_id).all()

def get_or_create_progress(db: Session, student_id: int):
    prog = db.query(models.Progress).filter(models.Progress.student_id == student_id).first()
    if not prog:
        prog = models.Progress(student_id=student_id, total_sessions=0, total_hours=0)
        db.add(prog)
        db.commit()
        db.refresh(prog)
    return prog

def update_progress(db: Session, student_id: int):
    prog = get_or_create_progress(db, student_id)
    
    completed_sessions = db.query(models.SessionBooking).filter(
        models.SessionBooking.student_id == student_id,
        models.SessionBooking.status == "completed"
    ).count()
    
    submissions = db.query(models.Submission).filter(
        models.Submission.student_id == student_id,
        models.Submission.grade.isnot(None)
    ).all()
    
    avg_grade = None
    if submissions:
        grades = [int(s.grade) for s in submissions if s.grade and s.grade.isdigit()]
        if grades:
            avg_grade = sum(grades) // len(grades)
    
    prog.total_sessions = completed_sessions
    prog.average_grade = avg_grade
    prog.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(prog)
    return prog

def get_assignments(db: Session, tutor_id: Optional[int] = None):
    query = db.query(models.Assignment)
    if tutor_id:
        query = query.filter(models.Assignment.tutor_id == tutor_id)
    return query.all()

def get_submissions_for_student(db: Session, student_id: int):
    return db.query(models.Submission).filter(models.Submission.student_id == student_id).all()
