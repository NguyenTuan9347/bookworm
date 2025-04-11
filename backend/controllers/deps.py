from collections.abc import Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session

from backend.core import security
from backend.core.config import settings
from backend.core.db import engine
from backend.models.users import User
from backend.models.tokens import TokenPayload


reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_PREFIX_STR}/login/access-token"
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as db_session:
        yield db_session


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]

def get_current_user_through_header(db_session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.ACCESS_SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db_session.get(User, token_data.sub)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

CurrentUser = Annotated[User, Depends(get_current_user_through_header)]

