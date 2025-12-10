from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/feedback", tags=["feedback"])

@router.post("/create", response_model=schemas.FeedbackOut)
def create_feedback(feedback_in: schemas.FeedbackCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    feedback = crud.create_feedback(
        db, 
        session_id=feedback_in.session_id,
        student_id=current_user.id,
        tutor_id=feedback_in.tutor_id,
        rating=feedback_in.rating,
        comment=feedback_in.comment
    )
    return feedback

@router.get("/tutor/{tutor_id}", response_model=List[schemas.FeedbackOut])
def get_tutor_feedback(tutor_id: int, db: Session = Depends(get_db)):
    return crud.get_feedback_for_tutor(db, tutor_id)
