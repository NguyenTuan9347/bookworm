from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from controllers.deps import SessionDep
from models.response import ListPayload
from repositories.utilities import get_unique_values
from shared import const_var 
from models.categories import Category

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/range", response_model = ListPayload)
def get_categories_range(session: SessionDep) -> Any:
  if not session:
    raise HTTPException(const_var.ErrorMessages.session_invalid)

  return ListPayload(data=get_unique_values(session, Category, "category_name"), type="str")


