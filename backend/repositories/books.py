from typing import List, Optional, Tuple, Dict, Any
from datetime import date
from sqlmodel import Session, select, func, and_, or_, case, desc, asc, Float, SQLModel
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.expression import label
from models import Book, Discount, Category, Author, Review
from models.paging_info import PaginatedResponse, PagingInfo
from models.books import SortByOptions, AllowedPageSize, BookRead, FeaturedSortOptions, BookReadWithDetails
from models.reviews import ReviewRead

def construct_base_book_query() -> Tuple[Any, str, str, str, str]:
    current_date = date.today()
    effective_price_label = "discount_price"
    dicount_amount_label = "discount_amount"

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

    query = (
        select(
            Book,
            label(
                effective_price_label,
                case(
                    (
                        discount_subquery.c.min_discount_price != None,
                        discount_subquery.c.min_discount_price
                    ),
                    else_= Book.book_price
                ).cast(Float)
            ),
            label(
                dicount_amount_label,
                case(
                    (
                        discount_subquery.c.min_discount_price != None,
                        (Book.book_price - discount_subquery.c.min_discount_price)
                    ),
                    else_=0.0
                ).cast(Float)
            )
        )
        .join(discount_subquery, discount_subquery.c.book_id == Book.id, isouter=True)
    )
    return query, effective_price_label, dicount_amount_label


def get_books(
    session: Session,
    page: int = 1,
    page_size: int = AllowedPageSize.TWENTY,
    sort_by: SortByOptions = SortByOptions.default,
    category_name: Optional[str] = None,
    author_name: Optional[str] = None,
    min_rating: Optional[int] = None
) -> PaginatedResponse:
    base_query, effective_price_label, dicount_amount_label = construct_base_book_query()
    review_count_label = "review_count"
    average_rating_label = "average_rating"

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

    count_subquery = filtered_query.with_only_columns(Book.id).distinct().subquery()
    count_query = select(func.count()).select_from(count_subquery)
    try:
        total_items = session.exec(count_query).one()
    except Exception as e:
        print(f"Count query failed: {e}")
        total_items = 0

    result_query = filtered_query
    if sort_by == SortByOptions.popularity:
        review_count_label = "review_count"
        avg_rating_label = "average_rating"
        group_by_cols = [Book.id] 
        
        result_query = (
            result_query
            .join(Review, Review.book_id == Book.id, isouter=True)
            .group_by(*group_by_cols)
            .add_columns(
                func.count(Review.id).label(review_count_label),
                func.coalesce(func.avg(Review.rating_start), 0.0).cast(Float).label(avg_rating_label)
             )
            .order_by(desc(review_count_label), asc(effective_price_label))
        )
    elif sort_by == SortByOptions.default:
        result_query = result_query.order_by(desc(dicount_amount_label), asc(effective_price_label))
    elif sort_by == SortByOptions.price_asc:
        result_query = result_query.order_by(asc(effective_price_label))
    elif sort_by == SortByOptions.price_desc:
        result_query = result_query.order_by(desc(effective_price_label))

    result_query = result_query.offset((page - 1) * page_size).limit(page_size)
    labels = [effective_price_label, dicount_amount_label, review_count_label, average_rating_label]
    items = []
    try:
        results = session.exec(result_query.options(selectinload(Book.author))).all()
        for row in results:
            data = row._mapping
            book: Book = data["Book"]
            book_data = book.model_dump()
            for label in labels:
                if label in data:
                    book_data[label] = data[label]
            book_data["author_name"] = book.author.author_name if book.author else None
            items.append(BookRead(**book_data))

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


def get_book_by_id(session: Session, book_id: int) -> Optional[BookReadWithDetails]:
    try:
        base_query, effective_price_label, dicount_amount_label = construct_base_book_query()

        query = base_query.where(Book.id == book_id).options(selectinload(Book.author),selectinload(Book.category))
        

        result = session.exec(query).first()
        if not result:
            return None        
        book: Book = result[0]

        book_data = book.model_dump()
                
        book_data.update({
            effective_price_label: getattr(result, effective_price_label),
            "category_name": getattr(book.category, "category_name", None),
            "author_name": getattr(book.author, "author_name", None),
        })

        book_data["reviews"] = [ReviewRead(**review.model_dump()) for review in book.reviews]

        return BookReadWithDetails(**book_data)

    except Exception as e:
        print(f"Failed to get book by ID {book_id}: {e}")
        return None


def get_top_k_discounted_books(session: Session, k: int = 10) -> List[BookRead]:
    result_query, effective_price_label, dicount_amount_label = construct_base_book_query()
    
    result_query = result_query.order_by(desc(dicount_amount_label))
    
    result_query = result_query.limit(k)

    labels = [effective_price_label, effective_price_label, dicount_amount_label]
    items = []
    try:
        results = session.exec(result_query).all()
        for row in results:
            data = row._mapping
            book: Book = data["Book"]
            book_data = book.model_dump()
            for label in labels:
                if label in data:
                    book_data[label] = data[label]
            book_data["author_name"] = book.author.author_name if book.author else None
            items.append(BookRead(**book_data))

    except Exception as e:
        print(f"Data query failed: {e}")
    
    return items


def get_top_k_featured(session: Session, sort_by: FeaturedSortOptions, k: int) -> List[BookRead]:
    base_query, effective_price_label, dicount_amount_label = construct_base_book_query()

    avg_rating_label = "average_rating"
    review_count_label = "review_count"

    query_with_aggregates = (
        base_query 
        .join(Review, Review.book_id == Book.id, isouter=True)
        .group_by(Book.id) 
        .add_columns(
            func.count(Review.id).label(review_count_label),
            func.coalesce(func.avg(Review.rating_start), 0.0).cast(Float).label(avg_rating_label)
        )
    )

    if sort_by == FeaturedSortOptions.RECOMMENDED:
        result_query = query_with_aggregates.order_by(
            desc(avg_rating_label),
            asc(effective_price_label) 
        )
    elif sort_by == FeaturedSortOptions.POPULAR:
        result_query = query_with_aggregates.order_by(
            desc(review_count_label),
            asc(effective_price_label) 
        )
    else:
         raise ValueError(f"Unsupported sort_by value for featured books: {sort_by}")

    result_query = result_query.limit(k)

    all_calculated_labels = [effective_price_label, dicount_amount_label, review_count_label, avg_rating_label]
    items = []
    try:
        results = session.exec(result_query).all()
        for row in results:
            data = row._mapping 
            book: Book = data["Book"]
            book_data = book.model_dump() 
            
            for label in all_calculated_labels:
                if label in data:
                    book_data[label] = data[label]
                    
            book_data["author_name"] = book.author.author_name if book.author else None
            items.append(BookRead(**book_data))

    except Exception as e:
        print(f"Data query failed for featured books (sort_by={sort_by}): {e}")
        items = [] 
        
    return items