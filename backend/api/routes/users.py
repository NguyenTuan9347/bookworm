import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import col, delete, func, select

from backend import crud
from backend.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from backend.core.config import settings
from backend.core.security import get_password_hash, verify_password
from backend.models.users import (
    User,
    UserRead,
    UserCreate,
    UserUpdate
)

router = APIRouter(prefix="/users", tags=["users"])