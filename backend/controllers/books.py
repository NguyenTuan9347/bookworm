import math
from typing import List, Optional

from fastapi import APIRouter, Query, Path, HTTPException, status, Depends
from core.geoip import get_country_code
from core.localization import get_localized_price
from models.books import BookRead, BookReadWithDetails, AllowedPageSize, SortByOptions, FeaturedSortOptions
from models.paging_info import PaginatedResponse
from controllers.deps import SessionDep
from repositories.books import get_books, get_book_by_id, get_top_k_discounted_books, get_top_k_featured
from core.config import settings

router = APIRouter(tags=["Books"])

def localize_book_prices(books: List[BookRead], country_code: Optional[str]) -> List[BookRead]:
    if not books:
        return books
    
    for idx, book in enumerate(books):
        localize_discount_price, symbol = get_localized_price(
            book.discount_price, 
            country_code=country_code, 
            currency_rates=settings.CURRENCY_RATES_DICT
        )
        localized_price, symbol = get_localized_price(
            book.book_price, 
            country_code=country_code, 
            currency_rates=settings.CURRENCY_RATES_DICT
        )
        book.localize_price = localized_price
        book.price_symbol = symbol
        book.localize_discount_price = localize_discount_price
        books[idx] = book
    return books

@router.get(
    "/book/{book_id}",
    response_model=BookReadWithDetails,
    summary="Get a single book details"
)
def get_book(
    session: SessionDep,
    book_id: int = Path(..., title="The ID of the book to get", ge=1),
    country_code: Optional[str] = Depends(get_country_code)
):
    if session is None: 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database session not available")

    db_book = get_book_by_id(session=session, book_id=book_id)
    if db_book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    db_book = localize_book_prices([db_book], country_code)[0]

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
    country_code: Optional[str] = Depends(get_country_code)
):
    if session is None: 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database session not available")

    page_content = get_books(
        session=session,
        page=page,
        page_size=page_size.value,
        sort_by=sort_by,
        category_name=category,
        author_name=author,
        min_rating=min_rating
    )
    page_content.data = localize_book_prices(page_content.data, country_code)
    return page_content

@router.get(
    "/books/top-discounted",
    response_model=List[BookRead],
    summary="Handles the web request to list most discounted books"
)
def list_most_discounted_books(
    session: SessionDep,
    top_k: int = Query(10, title="Top k discounted book", ge=1),
    country_code: Optional[str] = Depends(get_country_code)
):
    if session is None: 
        raise HTTPException(status_code=500, detail="Database session not available")

    discounted_books = get_top_k_discounted_books(session=session, k=top_k)
    discounted_books = localize_book_prices(discounted_books, country_code)
    
    return discounted_books

@router.get(
    "/books/recommended",
    response_model=List[BookRead], 
    summary="Get top K featured books (recommended)"
)
def list_featured_books(
    session: SessionDep,
    top_k: int = Query(8, title="Number of books to return", ge=1),
    country_code: Optional[str] = Depends(get_country_code)
):
    if session is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database session not available")

    books = get_top_k_featured(session=session, sort_by=FeaturedSortOptions.RECOMMENDED, k=top_k)
    books = localize_book_prices(books, country_code)
    return books

@router.get(
    "/books/popular",
    response_model=List[BookRead], 
    summary="Get top K featured books (popular)"
)
def list_featured_books(
    session: SessionDep,
    top_k: int = Query(8, title="Number of books to return", ge=1),
    country_code: Optional[str] = Depends(get_country_code)
):
    if session is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database session not available")

    books = get_top_k_featured(session=session, sort_by=FeaturedSortOptions.POPULAR, k=top_k)
    books = localize_book_prices(books, country_code)
    return books