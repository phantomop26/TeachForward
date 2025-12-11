from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.get("/tutors", response_model=List[schemas.UserOut])
def tutors(db: Session = Depends(get_db)):
    return crud.list_tutors(db)

@router.post("/book", response_model=schemas.SessionOut)
def book_session(session_in: schemas.SessionCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    student_id = current_user.id
    return crud.create_session(db, student_id, session_in)

@router.get("/my-sessions", response_model=List[schemas.SessionOut])
def get_my_sessions(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role == "student":
        return crud.get_sessions_for_student(db, current_user.id)
    elif current_user.role == "tutor":
        return crud.get_sessions_for_tutor(db, current_user.id)
    return []

@router.put("/{session_id}/status")
def update_status(session_id: int, status: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    session = crud.update_session_status(db, session_id, status)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"ok": True, "session": session}

@router.post("/assign-homework", response_model=schemas.AssignmentOut)
def assign_homework(
    assignment_in: schemas.AssignmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Create an assignment for a specific student or session (tutor only)"""
    if current_user.role != "tutor":
        raise HTTPException(status_code=403, detail="Only tutors can assign homework")
    
    from .. import models
    assignment = models.Assignment(
        tutor_id=current_user.id,
        student_id=assignment_in.student_id,
        session_id=assignment_in.session_id,
        title=assignment_in.title,
        description=assignment_in.description,
        due_date=assignment_in.due_date
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

@router.get("/my-students", response_model=List[schemas.UserOut])
def get_my_students(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get list of students who have booked sessions with this tutor"""
    if current_user.role != "tutor":
        raise HTTPException(status_code=403, detail="Only tutors can view their students")
    
    from .. import models
    # Get unique student IDs from sessions
    student_ids = db.query(models.SessionBooking.student_id).filter(
        models.SessionBooking.tutor_id == current_user.id
    ).distinct().all()
    
    student_ids = [sid[0] for sid in student_ids]
    students = db.query(models.User).filter(models.User.id.in_(student_ids)).all()
    return students

@router.get("/all-students", response_model=List[schemas.UserOut])
def get_all_students(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get list of all students (for tutors to assign homework)"""
    if current_user.role != "tutor":
        raise HTTPException(status_code=403, detail="Only tutors can view students")
    
    from .. import models
    # Get all users with role='student'
    students = db.query(models.User).filter(models.User.role == "student").all()
    return students

@router.delete("/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Delete a session (only if user is the student who booked it or the tutor)"""
    from .. import models
    
    session = db.query(models.SessionBooking).filter(
        models.SessionBooking.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if user has permission to delete
    if session.student_id != current_user.id and session.tutor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this session")
    
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}
