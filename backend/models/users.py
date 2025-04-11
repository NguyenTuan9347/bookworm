from typing import Optional
from sqlmodel import Field, SQLModel

class UserBase(SQLModel):
  username: str = Field(index=True)
  email: str = Field(unique=True, index=True)
  full_name: Optional[str] = None


class UserUpdate(SQLModel): 
  username: Optional[str] = None
  email: Optional[str] = None
  full_name: Optional[str] = None
  password: Optional[str] = None 

class User(UserBase, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  hashed_password: str

class UserCreate(UserBase):
  password: str

class UserRead(UserBase): 
  id: int 