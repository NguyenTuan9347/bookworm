from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Request, Response, HTTPException, status
from pydantic import BaseModel

from repositories.users import authenticate, get_user_by_id
from controllers.deps import SessionDep
from core import security
from core.config import settings
from models.tokens import Token
from shared.const_var import ErrorMessages, SuccessMessages

router = APIRouter(tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None

def is_web_client(request: Request) -> bool:
    client_type = request.headers.get("X-Client-Type", "").lower()
    if client_type in ["web", "native"]:
        return client_type == "web"
    
    user_agent = request.headers.get("User-Agent", "").lower()
    if not user_agent:
        return False
    browser_keywords = ["mozilla", "chrome", "safari", "firefox", "edge", "opera"]
    native_keywords = ["okhttp", "android", "ios", "your-app-name"]  # Customize for your app
    if any(keyword in user_agent for keyword in browser_keywords):
        return True
    if any(keyword in user_agent for keyword in native_keywords):
        return False
    return False

@router.post("/login", response_model=Token)
def login(
    db_session: SessionDep,
    form_data: LoginRequest,
    request: Request,
    response: Response,
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
        subject=user.id,
        expires_delta=access_token_expires,
        secret_key=settings.ACCESS_SECRET_KEY,
    )

    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    refresh_token = security.create_jwt_token(
        subject=user.id,
        expires_delta=refresh_token_expires,
        secret_key=settings.REFRESH_SECRET_KEY,
    )

    if is_web_client(request):
        response.set_cookie(
            key=settings.REFRESH_TOKEN_KEY,
            value=refresh_token,
            httponly=settings.COOKIES_HTTP_ONLY,
            secure=settings.COOKIES_HTTPS_ONLY,
            samesite=settings.COOKIES_SAMESITE_POLICY,
            max_age=int(refresh_token_expires.total_seconds()),
        )
        return Token(access_token=access_token, refresh_token=None)
    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh", response_model=Token)
def refresh_token(
    db_session: SessionDep,
    request: Request,
    response: Response,
    body: Optional[RefreshTokenRequest] = None,
) -> Token:
    refresh_token = None
    is_web = is_web_client(request)

    if is_web:
        refresh_token = request.cookies.get(settings.REFRESH_TOKEN_KEY)
    elif body:
        refresh_token = body.refresh_token
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing refresh token",
            headers={"WWW-AuthDetail": "Invalid or missing refresh token", "WWW-Authenticate": "Bearer"},
        )

    try:
        payload = security.verify_token(
            token=refresh_token,
            secret_key=settings.REFRESH_SECRET_KEY,
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user = get_user_by_id(db_session= db_session,user_id= user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_jwt_token(
        subject=user.id,
        expires_delta=access_token_expires,
        secret_key=settings.ACCESS_SECRET_KEY,
    )

    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    new_refresh_token = security.create_jwt_token(
        subject=user.id,
        expires_delta=refresh_token_expires,
        secret_key=settings.REFRESH_SECRET_KEY,
    )

    if is_web:
        response.set_cookie(
            key=settings.REFRESH_TOKEN_KEY,
            value=new_refresh_token,  
            httponly=settings.COOKIES_HTTP_ONLY,
            secure=settings.COOKIES_HTTPS_ONLY,
            samesite=settings.COOKIES_SAMESITE_POLICY,
            max_age=int(refresh_token_expires.total_seconds()),
        )
        return Token(access_token=access_token, refresh_token=None)
    return Token(access_token=access_token, refresh_token=new_refresh_token)

@router.post("/logout")
def logout(request: Request, response: Response):
    if is_web_client(request):
        response.set_cookie(
            key=settings.REFRESH_TOKEN_KEY,
            value="",
            httponly=settings.COOKIES_HTTP_ONLY,
            secure=settings.COOKIES_HTTPS_ONLY,
            samesite=settings.COOKIES_SAMESITE_POLICY,
            max_age=0,
            path="/",
        )
    return {"message": SuccessMessages.success_logout}