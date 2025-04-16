from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from controllers.deps import SessionDep
from models.response import ListPayload
from repositories.utilities import get_unique_values
from shared import const_var 
from models.authors import Author

router = APIRouter(prefix="/authors", tags=["authors"])

@router.get("/range", response_model = ListPayload)
def get_categories_range(session: SessionDep) -> Any:
  if not session:
    raise HTTPException(const_var.ErrorMessages.session_invalid)

  return ListPayload(data=get_unique_values(session, Author, "author_name"), type="str")

