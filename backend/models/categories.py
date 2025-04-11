import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import Column, DateTime, Numeric
from sqlalchemy.sql import func
from sqlmodel import Field, Relationship, SQLModel
from books import Book, BookRead


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

class CategoryReadWithBooks(CategoryRead):
  books: List["BookRead"] = []
