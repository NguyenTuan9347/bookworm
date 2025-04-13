
import datetime
from decimal import Decimal
from typing import Optional

from sqlmodel import Column, Numeric
from sqlmodel import Field, Relationship, SQLModel
from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from models.books import Book

class DiscountBase(SQLModel):
  book_id: int = Field(foreign_key="book.id", index=True)
  discount_start_date: datetime.date
  discount_end_date: datetime.date
  discount_price: Decimal = Field(
    sa_column=Column(Numeric(5, 2))
  )

class Discount(DiscountBase, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)

  book: "Book" = Relationship(back_populates="discounts")

class DiscountCreate(DiscountBase):
  pass

class DiscountRead(DiscountBase):
  id: int
  

