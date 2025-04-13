from typing import List, Optional, Tuple
from datetime import date
from sqlmodel import Session, select, func, and_, or_, case, desc, asc, Float
from sqlalchemy.sql.expression import label
from models import Book, Discount, Category, Author, Review
from models.paging_info import PaginatedResponse, PagingInfo
from models.books import SortByOptions, AllowedPageSize


def construct_base_book_query():
    current_date = date.today()
    effective_price_label = "effective_price"
    discount_percent_label = "discount_percent"

    discount_subquery = (
        select(
            Discount.book_id,
            func.min(Discount.discount_price).label("min_discount_price")
        )
        .where(
            and_(
                Discount.discount_start_date <= current_date,
                or_(
                    Discount.discount_end_date == None,
                    Discount.discount_end_date >= current_date
                )
            )
        )
        .group_by(Discount.book_id)
        .subquery()
    )

    return (
        select(
            Book,
            label(
                effective_price_label,
                case(
                    (
                        discount_subquery.c.min_discount_price != None,
                        discount_subquery.c.min_discount_price
                    ),
                    else_=Book.book_price
                )
            ),
            label(
                discount_percent_label,
                case(
                    (
                        discount_subquery.c.min_discount_price != None,
                        ((Book.book_price - discount_subquery.c.min_discount_price) / Book.book_price) * 100
                    ),
                    else_=0
                )
            )
        )
        .select_from(Book)
        .join(discount_subquery, discount_subquery.c.book_id == Book.id, isouter=True)
    ), effective_price_label, discount_percent_label



def get_books(
    session: Session,
    page: int = 1,
    page_size: int = AllowedPageSize.TWENTY,
    sort_by: SortByOptions = SortByOptions.default,
    category_name: Optional[str] = None,
    author_name: Optional[str] = None,
    min_rating: Optional[int] = None
) -> PaginatedResponse:
    base_query, effective_price_label, discount_percent_label = construct_base_book_query()

    filtered_query = base_query
    if category_name:
        filtered_query = filtered_query.join(Category).where(Category.category_name == category_name)
    if author_name:
        filtered_query = filtered_query.join(Author).where(Author.author_name == author_name)
    if min_rating:
        rating_subquery = (
            select(
                Review.book_id,
                func.avg(Review.rating_start).cast(Float).label("avg_rating")
            )
            .group_by(Review.book_id)
            .having(func.avg(Review.rating_start) >= min_rating)
            .subquery()
        )
        filtered_query = filtered_query.join(rating_subquery, rating_subquery.c.book_id == Book.id)

    count_query = select(func.count()).select_from(filtered_query)
    try:
        total_items = session.exec(count_query).one()
    except Exception as e:
        print(f"Count query failed: {e}")
        total_items = 0

    result_query = filtered_query
    if sort_by == SortByOptions.popularity:
        review_count = func.count(Review.id).label("review_count")
        avg_rating = func.coalesce(func.avg(Review.rating_start), 0.0).cast(Float).label("average_rating")
        result_query = (
            result_query
            .join(Review, isouter=True)
            .group_by(Book.id, effective_price_label, discount_percent_label)
            .add_columns(review_count, avg_rating)
            .order_by(desc("review_count"), asc(effective_price_label))
        )
    elif sort_by == SortByOptions.default:
        result_query = result_query.order_by(desc(effective_price_label), asc(discount_percent_label))
    elif sort_by == SortByOptions.price_asc:
        result_query = result_query.order_by(asc(effective_price_label))
    elif sort_by == SortByOptions.price_desc:
        result_query = result_query.order_by(desc(effective_price_label))

    result_query = result_query.offset((page - 1) * page_size).limit(page_size)

    try:
        results = session.exec(result_query).all()
        items = [row.Book if hasattr(row, 'Book') else row for row in results]
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



def get_book_by_id(session: Session, book_id: int) -> Optional[Book]:
    try:
        book = session.get(Book, book_id)
        return book
    except Exception as e:
        print(f"Database query failed: {e}")
        return None