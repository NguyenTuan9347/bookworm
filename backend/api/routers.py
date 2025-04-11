from fastapi import APIRouter

from backend.api.routes import items, login, private, users, utils
from backend.core.config import settings

api_router = APIRouter()
api_router.include_router(users.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)