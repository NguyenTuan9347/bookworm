from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
  username: str
  password: str

class RefreshTokenRequest(BaseModel):
  refresh_token: str

class LogoutRequest(BaseModel):
  refresh_token: Optional[str] = None