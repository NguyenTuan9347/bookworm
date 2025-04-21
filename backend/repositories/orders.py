from sqlmodel import Session
from models import Order, OrderItem
from models.orders import OrderCreate, OrderItemCreate
from shared.const_var import SuccessMessages, ErrorMessages


def create_order(db_session: Session, order_create: OrderCreate) -> tuple[dict, int]:
    try:
        order_amount = sum(
            item.quantity * item.price for item in order_create.items
        )

        order = Order.model_validate(order_create, update={"order_amount": order_amount})

        with db_session.begin():
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


def create_order_item(session: Session, item: OrderItemCreate, order_id: int) -> tuple[str, int]:
    try:
        order_item = OrderItem(
            order_id=order_id,
            book_id=item.book_id,
            quantity=item.quantity,
            book_price=item.price
        )
        session.add(order_item)
        return "Success", 200
    except Exception as e:
        return str(e), 400
