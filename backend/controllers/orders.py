from fastapi import APIRouter, status, HTTPException
from typing import Any
from fastapi.responses import JSONResponse
from controllers.deps import SessionDep
from repositories.orders import create_order
from models.orders import OrderCreate
from shared.const_var import SuccessMessages, ErrorMessages

router = APIRouter(prefix="/order", tags=["Orders"])

@router.post("")
def add_order(db_session: SessionDep, order_create: OrderCreate) -> Any:
    if len(order_create.items) == 0:
      raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=ErrorMessages.invalid_order)

    if any(item.quantity < 8 for item in order_create.items):
      raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=ErrorMessages.invalid_order)

    messages, status_code = create_order(db_session, order_create)

    if status_code >= 400:
      raise HTTPException(status_code=status_code, detail=messages)

    return JSONResponse(
      status_code=status.HTTP_201_CREATED,
      content={
        "message": SuccessMessages.order_success
      }
    )
