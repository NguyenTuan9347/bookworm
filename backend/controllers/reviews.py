from fastapi import APIRouter, Query, HTTPException
from typing import Any, Optional

from models.books import AllowedPageSize
from models.reviews import ReviewSortByOptions, AllowedReviewStar, ReviewMetadataResponse
from controllers.deps import SessionDep
from models.response import ListPayload
from repositories.reviews import get_reviews, get_review_metadata
from repositories.utilities import get_unique_values
from shared import const_var 
from models.paging_info import PaginatedResponse
from models.reviews import Review

router = APIRouter(prefix="", tags=["Reviews"])


@router.get("/reviews", response_model=PaginatedResponse)
def get_reviews_by_book_id(
  session: SessionDep,
  book_id: int,
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

  return page_content


@router.get("/reviews/metadata", response_model=ReviewMetadataResponse)
def get_review_metadata_route(
  session: SessionDep,
  book_id: int = Query(..., description="Book ID to get review metadata for")
) -> Any:
  if not session:
    raise HTTPException(const_var.ErrorMessages.session_invalid)

  return get_review_metadata(session, book_id=book_id)


@router.get("/reviews/range", response_model=ListPayload)
def get_star_range(session: SessionDep) -> Any:
  if not session:
    raise HTTPException(const_var.ErrorMessages.session_invalid)

  return ListPayload(data=get_unique_values(session, Review, "rating_start"), type="int")
