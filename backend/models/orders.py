import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import Column, DateTime, Numeric
from sqlalchemy.sql import func
from sqlmodel import Field, Relationship, SQLModel


class OrderBase(SQLModel):
  user_id: int = Field(foreign_key="user.id", index=True)
  order_date: datetime.datetime = Field(
    default_factory=datetime.datetime.now(datetime.timezone.utc),
    nullable=False
  )
  order_amount: Decimal = Field(
      sa_column=Column(Numeric(8, 2))
  )

class Order(OrderBase, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)

  order_items: List["OrderItem"] = Relationship(back_populates="order") 
  
class OrderCreate(OrderBase):
    pass

class OrderRead(OrderBase):
  id: int

class OrderReadWithDetails(OrderRead):
  items: List["OrderItemRead"] = [] 



class OrderItemBase(SQLModel):
  order_id: int = Field(foreign_key="order.id", index=True)
  book_id: int = Field(foreign_key="book.id", index=True)
  quantity: int 
  price: Decimal = Field(sa_column=Column(Numeric(5, 2)))

class OrderItem(OrderItemBase, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  order: Order = Relationship(back_populates="items")

class OrderItemCreate(OrderItemBase):
  pass


class OrderItem(OrderItemBase):
  quantity: Optional[int]

class OrderItemRead(OrderItemBase):
  id: int
