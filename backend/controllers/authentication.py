from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel 

from repositories.users import authenticate 
from controllers.deps import SessionDep, TokenDep 
from core import security
from core.config import settings
from models.tokens import Token, RefreshTokenRequest
from shared.const_var import ErrorMessages, SuccessMessages 
from models.tokens import TokenPayload
    

router = APIRouter(tags=["login"])

@router.post("/login", response_model=Token)
def login(
  db_session: SessionDep,
  form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:

  email = form_data.username
  password = form_data.password

  user = authenticate(db_session=db_session, email=email, password=password)
  if not user:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=ErrorMessages.incorrect_email_or_password, 
        headers={"WWW-Authenticate": "Bearer"}, 
    )

  access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
  access_token = security.create_jwt_token(
    subject=user.id, expires_delta=access_token_expires, secret_key= settings.ACCESS_SECRET_KEY
  )

  refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
  refresh_token = security.create_jwt_token(
      subject=user.id, expires_delta=refresh_token_expires, secret_key=settings.REFRESH_SECRET_KEY
  )

  return Token(
    access_token=access_token,
    refresh_token=refresh_token
  )


@router.post("/login/refresh", response_model=Token)
def refresh_access_token(
    refresh_request: RefreshTokenRequest, 
    db_session: SessionDep 
) -> Token:

    current_refresh_token = refresh_request.refresh_token

    payload = security.verify_token(current_refresh_token, settings.REFRESH_SECRET_KEY)
    if not payload:
      raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=ErrorMessages.invalid_refresh_token, 
        headers={"WWW-Authenticate": "Bearer"},
      )

    user_id = TokenPayload(**payload).sub
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = security.create_jwt_token(
      subject=user_id, expires_delta=access_token_expires, secret_key=settings.ACCESS_SECRET_KEY
    )

    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    new_refresh_token = security.create_jwt_token(
      subject=user_id, expires_delta=refresh_token_expires,secret_key=settings.REFRESH_SECRET_KEY
    )

    return Token (
      access_token=new_access_token,
      refresh_token=new_refresh_token
    )


@router.post("/logout")
async def logout():
  return {"message": SuccessMessages.success_logout}