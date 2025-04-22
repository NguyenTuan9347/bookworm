from fastapi import APIRouter, status, HTTPException
from typing import Any
from fastapi.responses import JSONResponse
from controllers.deps import SessionDep, ValidOrderDep
from repositories.orders import create_order
from shared.const_var import SuccessMessages, ErrorMessages

router = APIRouter(prefix="/order", tags=["Orders"])

@router.post("")
def add_order(
    db_session: SessionDep,
    order_create: ValidOrderDep,
) -> Any:
    messages, status_code = create_order(db_session, order_create)

    if status_code >= 400:
      raise HTTPException(status_code=status_code, detail=messages)

    return JSONResponse(
      status_code=status.HTTP_201_CREATED,
      content={"message": SuccessMessages.order_success},
    )
