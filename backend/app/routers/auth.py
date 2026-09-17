from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import LoginIn, RegisterIn, TokenOut, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _to_out(user: User) -> UserOut:
    return UserOut.model_validate(user)


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    existing = db.query(User).filter(func.lower(User.email) == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    user = User(
        name=payload.name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
        role=payload.validated_role(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(str(user.id), user.role)
    return TokenOut(access_token=token, user=_to_out(user))


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    user = db.query(User).filter(func.lower(User.email) == email).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token(str(user.id), user.role)
    return TokenOut(access_token=token, user=_to_out(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return _to_out(user)
