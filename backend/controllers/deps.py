from collections.abc import Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session
from sqlmodel import Session
from models.books import Book
from models.orders import OrderCreate
from repositories.books import construct_base_book_query

from core import security
from core.config import settings
from sqlmodel import create_engine

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)

from core.security import verify_token

from models.users import User
from models.tokens import TokenPayload


reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_PREFIX_STR}/login"
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as db_session:
        yield db_session


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]

def get_current_user_through_header(db_session: SessionDep, token: TokenDep) -> User:
    
    try:
        payload = verify_token(token, secret_key=settings.ACCESS_SECRET_KEY)
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db_session.get(User, token_data.sub)
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return user

CurrentUser = Annotated[User, Depends(get_current_user_through_header)]

from fastapi import HTTPException, status
from shared.const_var import ErrorMessages 
from typing import List

async def validate_order_items(
    db_session: SessionDep,
    order_create: OrderCreate,
) -> OrderCreate:
    book_ids = [item.book_id for item in order_create.items]

    query, effective_price_label, _ = construct_base_book_query()
    query = query.where(Book.id.in_(book_ids))

    result = db_session.exec(query).all()

    price_map = {
        row.Book.id: {
            "book_price": float(row.Book.book_price),
            "discount_price": getattr(row, effective_price_label)
        }
        for row in result
    }

    errors: List[dict] = []

    for item in order_create.items:
        if item.book_id not in price_map:
            errors.append({
                "book_id": item.book_id,
                "error": "Book does not exist"
            })
            continue

        price_info = price_map[item.book_id]
        book_price = round(price_info["book_price"], 2)
        discount_price = round(price_info["discount_price"], 2)
        item_price = round(float(item.price), 2)

        if item_price != book_price and item_price != discount_price:
            errors.append({
                "book_id": item.book_id,
                "error": f"Invalid price: expected {book_price} or {discount_price}, got {item_price}"
            })

        if item.quantity < 1 or item.quantity > 8:
            errors.append({
                "book_id": item.book_id,
                "error": "Invalid quantity (must be 1-8)"
            })

    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": ErrorMessages.order_failed,
                "errors": errors
            }
        )

    return order_create


ValidOrderDep = Annotated[OrderCreate, Depends(validate_order_items)]
