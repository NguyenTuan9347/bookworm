from sqlmodel import Session
from models import Order, OrderItem
from models.orders import OrderCreate, OrderItemCreate
from shared.const_var import SuccessMessages, ErrorMessages


def create_order(db_session: Session, order_create: OrderCreate) -> tuple[dict, int]:
    try:
        order_amount = sum(
            item.quantity * item.price for item in order_create.items
        )
        
        order_data = order_create.model_dump(exclude={"items"})
        order = Order(**order_data)
        order.order_amount=order_amount

        with db_session.begin_nested() :
            db_session.add(order)
            db_session.flush()

            for item in order_create.items:
                msg, status = create_order_item(db_session, item, order.id)
                if status >= 400:
                    raise Exception(f"{item.book_id}:{msg}")
        
        return {"message": SuccessMessages.order_success}, 200

    except Exception as e:
        if ":" in str(e):
            book_id, error_msg = str(e).split(":", 1)
            return {
                "message": ErrorMessages.order_failed,
                "errors": [{"book_id": int(book_id), "error": error_msg.strip()}]
            }, 400

        return {"message": ErrorMessages.order_failed, "errors": [{"error": str(e)}]}, 500


def create_order_item(session: Session, order_item_create: OrderItemCreate, order_id: int) -> tuple[str, int]:
    try:
        order_item = OrderItem.model_validate(order_item_create, update={"order_id": order_id})
        session.add(order_item)
        return "Success", 200
    except Exception as e:
        return str(e), 400

