from decimal import Decimal
from typing import List, Optional

from sqlmodel import Column, Numeric
from sqlmodel import Field, Relationship, SQLModel
from backend.models.categories import Category, CategoryRead
from backend.models.authors import Author, AuthorRead 
from backend.models.reviews import Review
from backend.models.discounts import Discount
from backend.models.orders import OrderItem


class BookBase(SQLModel):
  book_title: str = Field(index=True, max_length=255)
  book_summary: Optional[str] = Field(default=None) 
  book_price: Decimal = Field(sa_column=Column(Numeric(5, 2)))
  book_cover_photo: Optional[str] = Field(default=None, max_length=200)
  category_id: int = Field(foreign_key="category.id", index=True)
  author_id: int = Field(foreign_key="author.id", index=True)

class Book(BookBase, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)

  category: Category = Relationship(back_populates="books")
  author: Author = Relationship(back_populates="books")
  reviews: List["Review"] = Relationship(back_populates="book")
  discounts: List["Discount"] = Relationship(back_populates="book")
  order_items: List["OrderItem"] = Relationship(back_populates="book")

class BookCreate(BookBase):
  pass

class BookRead(BookBase):
  id: int

class BookReadWithDetails(BookRead):
  category: CategoryRead
  author: AuthorRead
