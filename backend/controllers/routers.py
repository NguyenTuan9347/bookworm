from fastapi import APIRouter

from backend.controllers import authentication
from backend.core.config import settings

api_router = APIRouter()
api_router.include_router(authentication.router)

