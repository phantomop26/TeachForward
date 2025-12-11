from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
from .. import schemas, crud
from ..deps import get_db, get_current_user
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.environ.get("SECRET_KEY", "devsecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def create_access_token(data: dict, expires_delta: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        print(f"DEBUG: Registration attempt for {user_in.email}")
        print(f"DEBUG: Password length: {len(user_in.password)} characters")
        print(f"DEBUG: Password bytes: {len(user_in.password.encode('utf-8'))} bytes")
        print(f"DEBUG: Full name: {user_in.full_name}")
        print(f"DEBUG: Role: {user_in.role}")
        
        # Truncate password to 72 characters BEFORE any processing
        password = user_in.password[:72] if len(user_in.password) > 72 else user_in.password
        print(f"DEBUG: After truncation - Password length: {len(password)} characters")
        
        # Check if user exists
        existing = crud.get_user_by_email(db, user_in.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user with truncated password
        user_data = schemas.UserCreate(
            email=user_in.email,
            password=password,
            full_name=user_in.full_name,
            role=user_in.role
        )
        user = crud.create_user(db, user_data)
        print(f"DEBUG: User created successfully with ID: {user.id}")
        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR: Registration failed - {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=schemas.Token)
def login(form_data: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"DEBUG: Login attempt for email: {form_data.email}")
    user = crud.get_user_by_email(db, form_data.email)
    print(f"DEBUG: User found: {user is not None}")
    if user:
        print(f"DEBUG: User ID: {user.id}, Email: {user.email}")
        password_valid = crud.verify_password(form_data.password, user.hashed_password)
        print(f"DEBUG: Password valid: {password_valid}")
        print(f"DEBUG: Password length received: {len(form_data.password)}")
    if not user or not crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def me(current_user=Depends(get_current_user)):
    return current_user

@router.put("/update-profile", response_model=schemas.UserOut)
def update_profile(
    profile_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Update user profile including subjects for tutors"""
    if profile_update.full_name is not None:
        current_user.full_name = profile_update.full_name
    if profile_update.bio is not None:
        current_user.bio = profile_update.bio
    if profile_update.subjects is not None:
        current_user.subjects = profile_update.subjects
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/reset-password-request")
def reset_password_request(email: str, db: Session = Depends(get_db)):
    """
    Request password reset. In production, this would send an email.
    For now, it generates a reset token that can be used immediately.
    """
    user = crud.get_user_by_email(db, email)
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, a reset link has been sent"}
    
    # Generate a reset token (expires in 1 hour)
    reset_token = create_access_token(
        data={"sub": str(user.id), "type": "reset"},
        expires_delta=60  # 1 hour
    )
    
    # In production, send email with reset link
    # For development, return the token
    print(f"PASSWORD RESET TOKEN for {email}: {reset_token}")
    
    return {
        "message": "If the email exists, a reset link has been sent",
        "reset_token": reset_token  # Remove this in production
    }

@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    """Reset password using the reset token"""
    try:
        # Verify token
        from jose import JWTError
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        token_type = payload.get("type")
        
        if token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token type")
        
        # Get user
        user = crud.get_user(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Truncate password to 72 characters
        password = new_password[:72] if len(new_password) > 72 else new_password
        
        # Update password
        user.hashed_password = crud.get_password_hash(password)
        db.commit()
        
        return {"message": "Password reset successful"}
    
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    except Exception as e:
        print(f"ERROR: Password reset failed - {str(e)}")
        raise HTTPException(status_code=500, detail="Password reset failed")
