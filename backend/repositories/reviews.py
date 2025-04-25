from sqlmodel import Session, select, func
from typing import Optional

from models import Review
from models.reviews import ReviewRead, ReviewSortByOptions,AllowedReviewStar, ReviewMetadataResponse
from models.paging_info import PaginatedResponse
from sqlmodel import Session, select, func, desc, asc
from typing import Optional
from models import Review
from models.reviews import ReviewRead, ReviewSortByOptions
from models.paging_info import PaginatedResponse, PagingInfo
from sqlmodel import select, func
from sqlmodel import Session

def get_reviews(
    session: Session,
    page: int = 1,
    page_size: int = 20,
    sort_by: ReviewSortByOptions = ReviewSortByOptions.newest_to_oldest,
    book_id: Optional[int] = None,
    filter_rating: Optional[int] = None
) -> PaginatedResponse:
    
    base_query = select(Review)

    if book_id is not None:
        base_query = base_query.where(Review.book_id == book_id)

    if filter_rating is not None:
        base_query = base_query.where(Review.rating_start == filter_rating)

    count_query = select(func.count()).select_from(base_query.subquery())
    try:
        total_items = session.exec(count_query).one()
    except Exception as e:
        print(f"Count query failed: {e}")
        total_items = 0

    if sort_by == ReviewSortByOptions.newest_to_oldest:
        base_query = base_query.order_by(desc(Review.review_date))
    elif sort_by == ReviewSortByOptions.oldest_to_newest:
        base_query = base_query.order_by(asc(Review.review_date))

    paginated_query = base_query.offset((page - 1) * page_size).limit(page_size)

    try:
        reviews = session.exec(paginated_query).all()
        items = [ReviewRead.model_validate(review) for review in reviews]
    except Exception as e:
        print(f"Data query failed: {e}")
        items = []
        total_items = 0

    total_pages = (total_items + page_size - 1) // page_size if page_size > 0 else 0

    paging_info = PagingInfo(
        page=page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1
    )

    return PaginatedResponse(data=items, paging=paging_info)



def get_review_metadata(session: Session, book_id: int) -> ReviewMetadataResponse:
  min_star = min([int(s.value) for s in AllowedReviewStar])
  max_star = max([int(s.value) for s in AllowedReviewStar])

  rating_counts_query = (
      select(
        Review.rating_start,
        func.count(Review.id).label("count")
      )
      .where(Review.book_id == book_id)
      .group_by(Review.rating_start)
  )

  try:
    rating_counts_results = session.exec(rating_counts_query).all()
    rating_counts = {r[0]: r[1] for r in rating_counts_results}

    for star in range(min_star, max_star + 1):
        rating_counts.setdefault(star, 0)

    total_reviews = sum(rating_counts.values())

    if total_reviews > 0:
        weighted_sum = sum(star * count for star, count in rating_counts.items())
        avg_rating = round((weighted_sum / total_reviews),2)
    else:
        avg_rating = 0

  except Exception as e:
    print(f"Rating aggregation failed: {e}")
    rating_counts = {star: 0 for star in range(min_star, max_star + 1)}
    total_reviews = 0
    avg_rating = 0

  return ReviewMetadataResponse(
    star_counts=rating_counts,
    total_reviews=total_reviews,
    average_rating=avg_rating
  )
