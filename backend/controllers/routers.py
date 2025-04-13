from fastapi import APIRouter

from controllers import authentication
from core.config import settings
from controllers import books

api_router = APIRouter()
api_router.include_router(authentication.router)
api_router.include_router(books.router)

