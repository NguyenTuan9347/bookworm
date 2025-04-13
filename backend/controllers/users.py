import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import col, delete, func, select

from backend import crud
from controllers.deps import CurrentUser
from models.users import UserRead

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model = UserRead)
def read_user_me(current_user: CurrentUser) -> Any:
  return current_user
