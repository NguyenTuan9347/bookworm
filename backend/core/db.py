from sqlmodel import Session, create_engine, select
from backend.core.config import settings
from backend.models.users import User, UserCreate
from backend.repositories.users import create_user
print(settings.SQLALCHEMY_DATABASE_URI)
engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

def init_db(session: Session) -> None:
    from sqlmodel import SQLModel
    user = session.exec(
        select(User).where(User.email == settings.ADMIN_EMAIL)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.ADMIN_EMAIL,
            password=settings.ADMIN_PASSWORD,
            admin=True,
        )
    create_user(db_session=session, user_create=user_in)
        