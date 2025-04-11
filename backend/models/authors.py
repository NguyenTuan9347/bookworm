import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import Column, DateTime, Numeric
from sqlalchemy.sql import func
from sqlmodel import Field, Relationship, SQLModel
from books import Book, BookRead

class AuthorBase(SQLModel):
  author_name: str = Field(index=True, max_length=255)
  author_bio: Optional[str] = Field(default=None) 

class Author(AuthorBase, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)

  books: List["Book"] = Relationship(back_populates="author")

class AuthorCreate(AuthorBase):
  pass

class AuthorRead(AuthorBase):
  id: int

class AuthorReadWithBooks(AuthorRead):
  books: List["BookRead"] = []
