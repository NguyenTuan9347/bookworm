import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import Column, DateTime, Numeric
from sqlalchemy.sql import func
from sqlmodel import Field, Relationship, SQLModel
from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from models.books import Book


class CategoryBase(SQLModel):
  category_name: str = Field(index=True, max_length=120)
  category_desc: Optional[str] = Field(default=None, max_length=255)

class Category(CategoryBase, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)

  books: List["Book"] = Relationship(back_populates="category")

class CategoryCreate(CategoryBase):
  pass

class CategoryRead(CategoryBase):
  id: int

