
from typing import List, Optional, Dict
from enum import Enum
import datetime
from sqlmodel import Column, DateTime
from sqlmodel import Field, Relationship, SQLModel, func
from models.paging_info import PagingInfo
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from models.books import Book

class ReviewSortByOptions(str, Enum):
  newest_to_oldest = "newest"
  oldest_to_newest = "oldest"

class AllowedReviewStar(str, Enum):
  One = 1
  Two = 2
  Three = 3
  Four = 4
  Five = 5
  
from pydantic import BaseModel
from typing import Dict

class ReviewMetadataResponse(BaseModel):
  star_counts: Dict[int, int] 
  total_reviews: int
  average_rating: float
  
class ReviewBase(SQLModel):
  book_id: int = Field(foreign_key="book.id", index=True)
  review_title: str = Field(max_length=120)
  review_details: Optional[str] = Field(default=255)
  rating_start: int
  review_date: Optional[datetime.datetime] = Field(    
    sa_column=Column(
      DateTime(timezone=True),  
      server_default=func.now(),
    )
  )
class Review(ReviewBase, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)

  book: "Book" = Relationship(back_populates="reviews")

class ReviewCreate(ReviewBase):
  review_date: Optional[datetime.datetime] = None

class ReviewRead(ReviewBase):
  id: int

