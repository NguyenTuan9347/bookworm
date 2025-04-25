from typing import Any, Optional

from fastapi import APIRouter, Query, Path, HTTPException, status
from models.books import AllowedPageSize
from models.reviews import ReviewSortByOptions, AllowedReviewStar
from controllers.deps import SessionDep
from models.response import ListPayload
from repositories.reviews import get_reviews
from repositories.utilities import get_unique_values
from shared import const_var 
from models.paging_info import PaginatedResponse
from models.reviews import Review

router = APIRouter(prefix="", tags=["Reviews"])

@router.get("/reviews/T", response_model = PaginatedResponse)
def get_reviews_by_book_id(session: SessionDep, book_id: int,    
  page: int = Query(1, title="Page number", ge=1),
  page_size: AllowedPageSize = Query(AllowedPageSize.FIFTEEN, title="Items per page"),
  sort_by: ReviewSortByOptions = Query(ReviewSortByOptions.newest_to_oldest, title="Sorting criteria"),
  filter_rating: Optional[int] = Query(None, title="Minimum average rating", ge=1, le=5),
) -> Any:
  if not session:
    raise HTTPException(const_var.ErrorMessages.session_invalid)

  if not book_id:
    raise HTTPException(const_var.ErrorMessages.invalid_request)
  
  page_content = get_reviews(
    session=session, 
    page=page, 
    page_size=page_size, 
    sort_by=sort_by, 
    filter_rating=filter_rating,
    book_id=book_id
  )
  print(page_content)

  return page_content

@router.get("/reviews/range", response_model = ListPayload)
def get_star_range(session: SessionDep) -> Any:
  if not session:
    raise HTTPException(const_var.ErrorMessages.session_invalid)

  return ListPayload(data=get_unique_values(session, Review, "rating_start"), type="int")






