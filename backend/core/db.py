from sqlmodel import Session, create_engine, select

from backend import crud
from backend.core.config import settings
from backend.models import User, UserCreate

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


def init_db() -> None:
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
