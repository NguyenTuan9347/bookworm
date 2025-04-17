from sqlmodel import Field, SQLModel
from pydantic import BaseModel
from typing import Optional

class Token(SQLModel):
  access_token: str
  refresh_token: Optional[str]
  token_type: str = "Bearer"


class TokenPayload(SQLModel):
  sub: str | None = None

