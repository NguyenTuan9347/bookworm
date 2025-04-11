# app/models/__init__.py

# Import base SQLModel if you have one, or just use SQLModel directly
# from .base import SQLModel # Example if you have a base model file

# Import all table models here so SQLModel.metadata registers them
# This is crucial for Alembic's autogenerate feature.
from sqlmodel import SQLModel # Or your base SQLModel

# Import table models from their respective files
from .users import User # noqa F401 - Tell linters these imports are used (by metadata)
from .authors import Author # noqa F401
from .categories import Category # noqa F401
from .books import Book # noqa F401
from .reviews import Review # noqa F401
from .discounts import Discount # noqa F401
from .orders import Order, OrderItem # noqa F401

__all__ = [
    "SQLModel",
    "User",
    "Author",
    "Category",
    "Book",
    "Review",
    "Discount",
    "Order",
    "OrderItem",
]