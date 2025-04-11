from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

from backend.models.orders import Order, OrderRead

class UserBase(SQLModel):
  first_name: str = Field(max_length=50)
  last_name: str = Field(max_length=50)
  email: str = Field(unique=True, index=True, max_length=70)
  admin: bool = Field(default=False)

class User(UserBase, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  password: str = Field(max_length=255)

  orders: List["Order"] = Relationship(back_populates="user")

class UserCreate(UserBase):
  password: str

class UserRead(UserBase):
  id: int

class UserReadWithOrders(UserRead):
  orders: List["OrderRead"] = []

class UserUpdate(SQLModel): # Separate model for updates if needed
  first_name: Optional[str] = None
  last_name: Optional[str] = None
  email: Optional[str] = None # Consider validation if email can be updated
  admin: Optional[bool] = None
  # Password updates usually have a separate endpoint/process

