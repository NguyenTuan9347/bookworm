
import math
from typing import List, Optional

from fastapi import APIRouter, Query, Path, HTTPException
from models.books import BookRead, BookReadWithDetails, AllowedPageSize, SortByOptions, FeaturedSortOptions
from models.paging_info import PaginatedResponse
from controllers.deps import SessionDep
from repositories.books import get_books, get_book_by_id, get_top_k_discounted_books, get_top_k_featured

router = APIRouter(tags=["book"])

@router.get(
    "/book/{book_id}",
    response_model=BookReadWithDetails,
    summary="Get a single book details"
)
def get_book(
    session: SessionDep,
    book_id: int = Path(..., title="The ID of the book to get", ge=1)
):
    if session is None: 
        raise HTTPException(status_code=500, detail="Database session not available")

    db_book = get_book_by_id(session=session, book_id=book_id)

    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    return db_book


@router.get(
    "/books",
    response_model=PaginatedResponse,
    summary="List books with constrain and paging"
)
def list_books(
    session: SessionDep,
    page: int = Query(1, title="Page number", ge=1),
    page_size: AllowedPageSize = Query(AllowedPageSize.FIFTEEN, title="Items per page"),
    sort_by: SortByOptions = Query(SortByOptions.default, title="Sorting criteria"),
    category: Optional[str] = Query(None, title="Filter by category name"),
    author: Optional[str] = Query(None, title="Filter by author name"),
    min_rating: Optional[int] = Query(None, title="Minimum average rating", ge=1, le=5),
):
    if session is None: 
        raise HTTPException(status_code=500, detail="Database session not available")

    page_content = get_books(
        session=session,
        page=page,
        page_size=page_size.value,
        sort_by=sort_by,
        category_name=category,
        author_name=author,
        min_rating=min_rating
    )

    return page_content



@router.get(
    "/books/top-discounted",
    response_model=List[BookRead],
    summary="Handles the web request to list most discounted books"
)
def list_most_discounted_books(
    session: SessionDep,
    top_k: int = Query(10, title="Top k discounted book", ge=1)
    ):
    if session is None: 
        raise HTTPException(status_code=500, detail="Database session not available")

    discounted_books = get_top_k_discounted_books(session=session,k = top_k)
    
    return discounted_books



@router.get(
    "/books/featured",
    response_model=List[BookRead], 
    summary="Get top K featured books (recommended or popular)"
)
def list_featured_books(
    session: SessionDep,
    sort_by: FeaturedSortOptions = Query(FeaturedSortOptions.RECOMMENDED, title="Featured criteria"),
    top_k: int = Query(8, title="Number of books to return", ge=1) 
):
    if session is None:
        raise HTTPException(status_code=500, detail="Database session not available")

    books = get_top_k_featured(session=session, sort_by=sort_by, k=top_k)
    return books


