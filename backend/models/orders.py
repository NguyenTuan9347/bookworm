import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import Column, DateTime, Numeric
from sqlalchemy.sql import func
from sqlmodel import Field, Relationship, SQLModel

from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from models.books import Book
  from models.users import User

class OrderBase(SQLModel):
  user_id: int = Field(foreign_key="user.id", index=True)
  order_date: datetime.datetime = Field(
    default_factory=lambda: datetime.datetime.now(datetime.timezone.utc),
    nullable=False
  )

class Order(OrderBase, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  order_amount: Decimal = Field(
    sa_column=Column(Numeric(8, 2))
  )

  user: "User" = Relationship(back_populates="orders")
  
  items: List["OrderItem"] = Relationship(back_populates="order") 
  
class OrderCreate(OrderBase):
  items: List["OrderItemCreate"]

class OrderRead(OrderBase):
  id: int

class OrderReadWithDetails(OrderRead):
  items: List["OrderItemCreate"] = [] 



class OrderItemBase(SQLModel):
  book_id: int = Field(foreign_key="book.id", index=True)
  quantity: int
  price: Decimal = Field(sa_column=Column(Numeric(5, 2)))

class OrderItem(OrderItemBase, table=True):
  __tablename__ = "order_item"
  order_id: int = Field(foreign_key="order.id", index=True)
  id: Optional[int] = Field(default=None, primary_key=True)
  
  book: "Book" = Relationship(back_populates="order_items") 
  order: "Order" = Relationship(back_populates="items")
  
class OrderItemCreate(OrderItemBase):
  pass

class OrderItemRead(OrderItemBase):
  id: int
