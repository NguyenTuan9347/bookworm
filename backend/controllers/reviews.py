from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from controllers.deps import SessionDep
from models.response import ListPayload
from repositories.utilities import get_unique_values
from shared import const_var 
from models.reviews import Review

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.get("/range", response_model = ListPayload)
def get_start_range(session: SessionDep) -> Any:
  if not session:
    raise HTTPException(const_var.ErrorMessages.session_invalid)

  return ListPayload(data=get_unique_values(session, Review, "rating_start"), type="int")


