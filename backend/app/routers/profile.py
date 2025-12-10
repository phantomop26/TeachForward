from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/{user_id}", response_model=schemas.UserOut)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/update", response_model=schemas.UserOut)
def update_profile(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user = crud.update_user(db, current_user.id, full_name=user_update.full_name, bio=user_update.bio)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
