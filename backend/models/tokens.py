from sqlmodel import Field, SQLModel
from pydantic import BaseModel

class Token(SQLModel):
  access_token: str
  refresh_token: str
  token_type: str = "bearer"

class TokenPayload(SQLModel):
  sub: str | None = None

class RefreshTokenRequest(BaseModel):
  refresh_token: str