from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from passlib.context import CryptContext

from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"

import jwt
from datetime import datetime

def verify_token(token: str, secret_key: str) -> dict:
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        if payload.get("exp") and payload["exp"] < int(datetime.now(timezone.utc).timestamp()):
            raise jwt.ExpiredSignatureError("Token expired")
        return payload
    except jwt.InvalidTokenError:
        raise Exception("Invalid token")
    
def create_jwt_token(subject: str | Any, expires_delta: timedelta, secret_key: str) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
