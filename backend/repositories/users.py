import uuid
from typing import Any

from sqlmodel import Session, select

from core.security import get_password_hash, verify_password
from models.users import User, UserCreate, UserUpdate


def create_user(*, db_session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"password": get_password_hash(user_create.password)}
    )
    db_session.add(db_obj)
    db_session.commit()
    db_session.refresh(db_obj)
    return db_obj


def update_user(*, db_session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)
    return db_user


def get_user_by_email(*, db_session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = db_session.exec(statement).first()
    return session_user

def get_user_by_id(*, db_session: Session, user_id: int) -> User | None:
    statement = select(User).where(User.id == user_id)
    session_user = db_session.exec(statement).first()
    return session_user

def authenticate(*, db_session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(db_session=db_session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.password):
        return None
    return db_user
