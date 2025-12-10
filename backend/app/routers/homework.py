from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os
from .. import schemas, crud, models
from ..deps import get_db, get_current_user
from ..files import save_upload_file

router = APIRouter(prefix="/homework", tags=["homework"])

@router.post("/create", response_model=schemas.AssignmentOut)
def create_assignment(
    title: str = Form(...),
    description: str = Form(None),
    due_date: str = Form(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    a = models.Assignment(
        tutor_id=current_user.id,
        title=title,
        description=description,
        due_date=datetime.fromisoformat(due_date) if due_date else None
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return a

@router.get("/assignments", response_model=List[schemas.AssignmentOut])
def list_assignments(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role == "tutor":
        return crud.get_assignments(db, tutor_id=current_user.id)
    else:
        return crud.get_assignments(db)

@router.post("/submit")
def submit_assignment(
    assignment_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    path = save_upload_file(file)
    s = models.Submission(assignment_id=assignment_id, student_id=current_user.id, file_path=path)
    db.add(s)
    db.commit()
    db.refresh(s)
    return {"submission_id": s.id}

@router.get("/my-submissions", response_model=List[schemas.SubmissionOut])
def get_my_submissions(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_submissions_for_student(db, current_user.id)

@router.get("/submissions")
def list_submissions(assignment_id: int, db: Session = Depends(get_db)):
    subs = db.query(models.Submission).filter(models.Submission.assignment_id == assignment_id).all()
    return [{"id": s.id, "student_id": s.student_id, "file_path": s.file_path, "grade": s.grade, "feedback": s.feedback} for s in subs]

@router.post("/grade")
def grade_submission(
    submission_id: int = Form(...),
    grade: str = Form(...),
    feedback: str = Form(None),
    db: Session = Depends(get_db)
):
    s = db.query(models.Submission).get(submission_id)
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    s.grade = grade
    s.feedback = feedback
    db.commit()
    return {"ok": True}

@router.get("/file")
def get_file(path: str):
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)
