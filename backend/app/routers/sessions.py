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
