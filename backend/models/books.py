from decimal import Decimal
from typing import List, Optional

from sqlmodel import Column, Numeric
from sqlmodel import Field, Relationship, SQLModel
from models.categories import Category, CategoryRead
from models.authors import Author, AuthorRead 
from models.reviews import Review, ReviewRead
from models.discounts import Discount
from models.orders import OrderItem
from enum import Enum

class AllowedPageSize(int, Enum):
  FIVE = 5
  FIFTEEN = 15
  TWENTY = 20
  TWENTY_FIVE = 25

class SortByOptions(str, Enum):
  default = "on_sale"
  popularity = "popularity"
  price_asc = "price_asc"
  price_desc = "price_desc"

class FeaturedSortOptions(str, Enum):
  RECOMMENDED = "recommended" 
  POPULAR = "popular"       
  
class BookBase(SQLModel):
  book_title: str = Field(index=True, max_length=255)
  book_summary: Optional[str] = Field(default=None) 
  book_price: Decimal = Field(sa_column=Column(Numeric(5, 2)))
  book_cover_photo: Optional[str] = Field(default=None, max_length=200)
  category_id: int = Field(foreign_key="category.id", index=True)
  author_id: int = Field(foreign_key="author.id", index=True)

class Book(BookBase, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  category: "Category" = Relationship(back_populates="books")
  author: "Author" = Relationship(back_populates="books")
  reviews: List["Review"] = Relationship(back_populates="book")
  discounts: List["Discount"] = Relationship(back_populates="book")
  order_items: List["OrderItem"] = Relationship(back_populates="book")

class BookCreate(BookBase):
  pass

class BookRead(BookBase):
  id: int
  author_name: Optional[str] 
  discount_price: Optional[Decimal] = Field(sa_column=Column(Numeric(5, 2)))

class BookReadWithDetails(BookRead):
  category: "CategoryRead"
  author: "AuthorRead"
  reviews: List["ReviewRead"] = Relationship(back_populates="book")

