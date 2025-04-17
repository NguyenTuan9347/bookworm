from fastapi import APIRouter

from controllers import authentication
from core.config import settings
from controllers import books
from controllers import categories
from controllers import reviews
from controllers import authors
from controllers import users

api_router = APIRouter()
api_router.include_router(authentication.router)
api_router.include_router(books.router)
api_router.include_router(categories.router)
api_router.include_router(authors.router)
api_router.include_router(reviews.router)
api_router.include_router(users.router)
