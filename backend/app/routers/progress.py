from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])

@router.get("/me", response_model=schemas.ProgressOut)
def get_my_progress(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    progress = crud.update_progress(db, current_user.id)
    return progress

@router.get("/student/{student_id}", response_model=schemas.ProgressOut)
def get_student_progress(student_id: int, db: Session = Depends(get_db)):
    progress = crud.update_progress(db, student_id)
    return progress
