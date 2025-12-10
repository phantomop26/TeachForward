from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="student")
    bio = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    courses = relationship("Course", back_populates="student")

class TutorAvailability(Base):
    __tablename__ = "tutor_availability"
    id = Column(Integer, primary_key=True, index=True)
    tutor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start = Column(DateTime, nullable=False)
    end = Column(DateTime, nullable=False)
    tutor = relationship("User")

class SessionBooking(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tutor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start = Column(DateTime, nullable=False)
    end = Column(DateTime, nullable=False)
    topic = Column(String, nullable=True)
    status = Column(String, default="scheduled")
    zoom_link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    student = relationship("User", foreign_keys=[student_id])
    tutor = relationship("User", foreign_keys=[tutor_id])

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    tutor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    tutor = relationship("User")

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_path = Column(String, nullable=True)
    grade = Column(String, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    assignment = relationship("Assignment")
    student = relationship("User")

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    tutor_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer, nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    session = relationship("SessionBooking")
    student = relationship("User", foreign_keys=[student_id])
    tutor = relationship("User", foreign_keys=[tutor_id])

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

class Progress(Base):
    __tablename__ = "progress"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_sessions = Column(Integer, default=0)
    total_hours = Column(Integer, default=0)
    average_grade = Column(Integer, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    student = relationship("User")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=True)
    instructor = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    color = Column(String, nullable=True)  # For UI display
    created_at = Column(DateTime, default=datetime.utcnow)
    student = relationship("User", back_populates="courses")
    grade_components = relationship("GradeComponent", back_populates="course", cascade="all, delete-orphan")
    grade_entries = relationship("GradeEntry", back_populates="course", cascade="all, delete-orphan")

class GradeComponent(Base):
    __tablename__ = "grade_components"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    name = Column(String, nullable=False)  # e.g., "Assignments", "Midterm", "Final", "Attendance"
    weight = Column(Float, nullable=False)  # Percentage weight (0-100)
    created_at = Column(DateTime, default=datetime.utcnow)
    course = relationship("Course", back_populates="grade_components")
    entries = relationship("GradeEntry", back_populates="component", cascade="all, delete-orphan")

class GradeEntry(Base):
    __tablename__ = "grade_entries"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    component_id = Column(Integer, ForeignKey("grade_components.id"), nullable=False)
    name = Column(String, nullable=False)  # e.g., "Assignment 1", "Quiz 2"
    score = Column(Float, nullable=False)  # Actual score received
    max_score = Column(Float, nullable=False)  # Maximum possible score
    date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    course = relationship("Course", back_populates="grade_entries")
    component = relationship("GradeComponent", back_populates="entries")

class StudySession(Base):
    __tablename__ = "study_sessions"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)  # Calculated when session ends
    activity_type = Column(String, nullable=True)  # e.g., "studying", "tutoring", "homework"
    created_at = Column(DateTime, default=datetime.utcnow)
    student = relationship("User")
