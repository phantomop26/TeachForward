from pydantic import BaseModel, EmailStr
from typing import Optional, List
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
    bio: Optional[str] = None
    rating: Optional[int] = None
    subjects: Optional[str] = None

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    subjects: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class SessionCreate(BaseModel):
    tutor_id: int
    start: datetime
    end: datetime
    topic: Optional[str]

class SessionOut(BaseModel):
    id: int
    student_id: int
    tutor_id: int
    start: datetime
    end: datetime
    topic: Optional[str]
    status: Optional[str] = "scheduled"
    zoom_link: Optional[str] = None

    class Config:
        orm_mode = True

class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    student_id: Optional[int] = None
    session_id: Optional[int] = None

class AssignmentOut(BaseModel):
    id: int
    tutor_id: int
    student_id: Optional[int]
    session_id: Optional[int]
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    created_at: datetime
    
    class Config:
        orm_mode = True

class SubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    file_path: Optional[str]
    grade: Optional[str]
    feedback: Optional[str]
    created_at: datetime
    
    class Config:
        orm_mode = True

class FeedbackCreate(BaseModel):
    session_id: int
    tutor_id: int
    rating: int
    comment: Optional[str] = None

class FeedbackOut(BaseModel):
    id: int
    session_id: int
    student_id: int
    tutor_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    
    class Config:
        orm_mode = True

class ProgressOut(BaseModel):
    id: int
    student_id: int
    total_sessions: int
    total_hours: int
    average_grade: Optional[int]
    
    class Config:
        orm_mode = True

# Grade Tracking Schemas
class GradeComponentCreate(BaseModel):
    name: str
    weight: float

class GradeComponentOut(BaseModel):
    id: int
    course_id: int
    name: str
    weight: float
    
    class Config:
        orm_mode = True

class GradeEntryCreate(BaseModel):
    component_id: int
    name: str
    score: float
    max_score: float
    date: Optional[datetime] = None
    notes: Optional[str] = None

class GradeEntryOut(BaseModel):
    id: int
    course_id: int
    component_id: int
    name: str
    score: float
    max_score: float
    date: Optional[datetime]
    notes: Optional[str]
    
    class Config:
        orm_mode = True

class CourseCreate(BaseModel):
    name: str
    code: Optional[str] = None
    instructor: Optional[str] = None
    semester: Optional[str] = None
    color: Optional[str] = None

class CourseOut(BaseModel):
    id: int
    student_id: int
    name: str
    code: Optional[str]
    instructor: Optional[str]
    semester: Optional[str]
    color: Optional[str]
    grade_components: List[GradeComponentOut] = []
    grade_entries: List[GradeEntryOut] = []
    
    class Config:
        orm_mode = True

class StudySessionCreate(BaseModel):
    activity_type: Optional[str] = "studying"

class StudySessionEnd(BaseModel):
    session_id: int

class StudySessionOut(BaseModel):
    id: int
    student_id: int
    start_time: datetime
    end_time: Optional[datetime]
    duration_minutes: Optional[int]
    activity_type: Optional[str]
    
    class Config:
        orm_mode = True
