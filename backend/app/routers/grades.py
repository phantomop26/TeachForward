from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import User, Course, GradeComponent, GradeEntry, StudySession, Progress
from ..schemas import (
    CourseCreate, CourseOut, 
    GradeComponentCreate, GradeComponentOut,
    GradeEntryCreate, GradeEntryOut,
    StudySessionCreate, StudySessionOut, StudySessionEnd
)
from ..deps import get_current_user

router = APIRouter(prefix="/grades", tags=["grades"])

# ============ COURSES ============

@router.post("/courses", response_model=CourseOut)
def create_course(
    course: CourseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new course"""
    db_course = Course(
        student_id=current_user.id,
        **course.dict()
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.get("/courses", response_model=List[CourseOut])
def get_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all courses for current user"""
    courses = db.query(Course).filter(Course.student_id == current_user.id).all()
    return courses

@router.get("/courses/{course_id}", response_model=CourseOut)
def get_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific course"""
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.student_id == current_user.id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a course"""
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.student_id == current_user.id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"message": "Course deleted"}

# ============ GRADE COMPONENTS ============

@router.post("/courses/{course_id}/components", response_model=GradeComponentOut)
def create_grade_component(
    course_id: int,
    component: GradeComponentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a grade component to a course (e.g., Assignments 40%, Midterm 30%)"""
    # Verify course belongs to user
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.student_id == current_user.id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db_component = GradeComponent(
        course_id=course_id,
        **component.dict()
    )
    db.add(db_component)
    db.commit()
    db.refresh(db_component)
    return db_component

@router.delete("/components/{component_id}")
def delete_grade_component(
    component_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a grade component"""
    component = db.query(GradeComponent).join(Course).filter(
        GradeComponent.id == component_id,
        Course.student_id == current_user.id
    ).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    db.delete(component)
    db.commit()
    return {"message": "Component deleted"}

# ============ GRADE ENTRIES ============

@router.post("/courses/{course_id}/entries", response_model=GradeEntryOut)
def create_grade_entry(
    course_id: int,
    entry: GradeEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a grade entry (e.g., Assignment 1: 85/100)"""
    # Verify course belongs to user
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.student_id == current_user.id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Verify component exists and belongs to this course
    component = db.query(GradeComponent).filter(
        GradeComponent.id == entry.component_id,
        GradeComponent.course_id == course_id
    ).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    
    db_entry = GradeEntry(
        course_id=course_id,
        **entry.dict()
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    # Update overall average grade
    update_average_grade(current_user.id, db)
    
    return db_entry

@router.delete("/entries/{entry_id}")
def delete_grade_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a grade entry"""
    entry = db.query(GradeEntry).join(Course).filter(
        GradeEntry.id == entry_id,
        Course.student_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    
    # Update overall average grade
    update_average_grade(current_user.id, db)
    
    return {"message": "Entry deleted"}

# ============ GRADE CALCULATIONS ============

@router.get("/courses/{course_id}/grade")
def calculate_course_grade(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate current grade for a course"""
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.student_id == current_user.id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get all components and their entries
    components = db.query(GradeComponent).filter(
        GradeComponent.course_id == course_id
    ).all()
    
    if not components:
        return {"course_grade": None, "breakdown": []}
    
    total_weight = 0
    weighted_grade = 0
    breakdown = []
    
    for component in components:
        entries = db.query(GradeEntry).filter(
            GradeEntry.component_id == component.id
        ).all()
        
        if entries:
            # Calculate average for this component
            component_avg = sum(e.score / e.max_score * 100 for e in entries) / len(entries)
            component_contribution = component_avg * (component.weight / 100)
            weighted_grade += component_contribution
            total_weight += component.weight
            
            breakdown.append({
                "component": component.name,
                "weight": component.weight,
                "average": round(component_avg, 2),
                "contribution": round(component_contribution, 2),
                "entries_count": len(entries)
            })
    
    # Calculate final grade as percentage of total weight
    if total_weight > 0:
        course_grade = (weighted_grade / total_weight) * 100
    else:
        course_grade = None
    
    return {
        "course_grade": round(course_grade, 2) if course_grade else None,
        "total_weight": total_weight,
        "breakdown": breakdown
    }

# ============ STUDY TIME TRACKING ============

@router.post("/study-session/start", response_model=StudySessionOut)
def start_study_session(
    session: StudySessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start tracking a study session"""
    # Check if there's already an active session
    active_session = db.query(StudySession).filter(
        StudySession.student_id == current_user.id,
        StudySession.end_time == None
    ).first()
    
    if active_session:
        raise HTTPException(status_code=400, detail="Study session already active")
    
    db_session = StudySession(
        student_id=current_user.id,
        start_time=datetime.utcnow(),
        activity_type=session.activity_type
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.post("/study-session/end")
def end_study_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """End the current study session"""
    active_session = db.query(StudySession).filter(
        StudySession.student_id == current_user.id,
        StudySession.end_time == None
    ).first()
    
    if not active_session:
        raise HTTPException(status_code=404, detail="No active study session")
    
    active_session.end_time = datetime.utcnow()
    duration = (active_session.end_time - active_session.start_time).total_seconds() / 60
    active_session.duration_minutes = int(duration)
    db.commit()
    
    # Update total study hours in progress
    update_study_hours(current_user.id, db)
    
    return {"message": "Study session ended", "duration_minutes": active_session.duration_minutes}

@router.get("/study-session/active", response_model=StudySessionOut)
def get_active_study_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current active study session"""
    active_session = db.query(StudySession).filter(
        StudySession.student_id == current_user.id,
        StudySession.end_time == None
    ).first()
    
    if not active_session:
        raise HTTPException(status_code=404, detail="No active study session")
    
    return active_session

@router.get("/study-hours")
def get_study_hours(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get total study hours"""
    progress = db.query(Progress).filter(
        Progress.student_id == current_user.id
    ).first()
    
    if not progress:
        return {"total_hours": 0, "total_minutes": 0}
    
    return {
        "total_hours": progress.total_hours,
        "total_minutes": progress.total_hours * 60
    }

# ============ HELPER FUNCTIONS ============

def update_average_grade(student_id: int, db: Session):
    """Calculate and update overall average grade across all courses"""
    courses = db.query(Course).filter(Course.student_id == student_id).all()
    
    total_grades = []
    for course in courses:
        components = db.query(GradeComponent).filter(
            GradeComponent.course_id == course.id
        ).all()
        
        if not components:
            continue
        
        weighted_grade = 0
        total_weight = 0
        
        for component in components:
            entries = db.query(GradeEntry).filter(
                GradeEntry.component_id == component.id
            ).all()
            
            if entries:
                component_avg = sum(e.score / e.max_score * 100 for e in entries) / len(entries)
                weighted_grade += component_avg * (component.weight / 100)
                total_weight += component.weight
        
        if total_weight > 0:
            course_grade = (weighted_grade / total_weight) * 100
            total_grades.append(course_grade)
    
    # Update progress record
    progress = db.query(Progress).filter(Progress.student_id == student_id).first()
    if not progress:
        progress = Progress(student_id=student_id)
        db.add(progress)
    
    if total_grades:
        progress.average_grade = int(sum(total_grades) / len(total_grades))
    else:
        progress.average_grade = None
    
    db.commit()

def update_study_hours(student_id: int, db: Session):
    """Calculate and update total study hours"""
    total_minutes = db.query(StudySession).filter(
        StudySession.student_id == student_id,
        StudySession.duration_minutes != None
    ).with_entities(
        db.func.sum(StudySession.duration_minutes)
    ).scalar() or 0
    
    progress = db.query(Progress).filter(Progress.student_id == student_id).first()
    if not progress:
        progress = Progress(student_id=student_id)
        db.add(progress)
    
    progress.total_hours = int(total_minutes / 60)
    db.commit()
