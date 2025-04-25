import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session, delete
from datetime import datetime, timedelta
from decimal import Decimal

from main import backend
from controllers.deps import get_db
from models.reviews import Review
from models.books import Book
from models.authors import Author
from models.categories import Category

TEST_DATABASE_URL = "sqlite:///./test.db"

try:
  engine = create_engine(TEST_DATABASE_URL, echo=False)
  with engine.connect() as conn:
    pass
except Exception:
  TEST_DATABASE_URL = "sqlite:///./test.db"
  engine = create_engine(TEST_DATABASE_URL, echo=False, connect_args={"check_same_thread": False})

def get_session_override():
  with Session(engine) as session:
    yield session

@pytest.fixture(scope="module")
def client():
  with TestClient(backend) as c:
    c.app.dependency_overrides[get_db] = get_session_override
    yield c

@pytest.fixture(autouse=True)
def seed_data():
  with Session(engine) as session:
    session.exec(delete(Review))
    session.exec(delete(Book))
    session.exec(delete(Category))
    session.exec(delete(Author))
    session.commit()

    author = Author(id=1, author_name="Test Author")
    category = Category(id=1, category_name="Test Category")
    book1 = Book(id=1, book_title="Book One", book_price=Decimal("10.00"), category_id=1, author_id=1)
    book2 = Book(id=2, book_title="Book Two", book_price=Decimal("20.00"), category_id=1, author_id=1)

    session.add_all([author, category, book1, book2])
    session.commit()

    now = datetime.now()
    reviews = [
        Review(book_id=1, rating_start=5, review_title="Awesome", review_date=now - timedelta(days=2)),
        Review(book_id=1, rating_start=4, review_title="Pretty good", review_date=now - timedelta(days=1)),
        Review(book_id=1, rating_start=3, review_title="Average", review_date=now - timedelta(days=3)),
        Review(book_id=2, rating_start=2, review_title="Not great", review_date=now - timedelta(days=5)),
    ]

    session.add_all(reviews)
    session.commit()

def test_get_reviews_for_book(client):
  res = client.get("/reviews?book_id=1")
  assert res.status_code == 200
  data = res.json()
  assert len(data["data"]) == 3
  assert all(r["book_id"] == 1 for r in data["data"])

def test_filter_reviews_by_rating(client):
  res = client.get("/reviews?book_id=1&filter_rating=4")
  assert res.status_code == 200
  data = res.json()["data"]
  assert len(data) == 1
  assert all(r["rating_start"] == 4 for r in data)

def test_reviews_sort_by_newest(client):
  res = client.get("/reviews?book_id=1&sort_by=newest")
  assert res.status_code == 200
  dates = [r["review_date"] for r in res.json()["data"]]
  assert dates == sorted(dates, reverse=True)

def test_reviews_sort_by_oldest(client):
  res = client.get("/reviews?book_id=1&sort_by=oldest")
  assert res.status_code == 200
  dates = [r["review_date"] for r in res.json()["data"]]
  assert dates == sorted(dates)

def test_reviews_pagination(client):
  res = client.get("/reviews?book_id=1&page=1&page_size=15")
  assert res.status_code == 200
  data = res.json()
  assert data["paging"]["page"] == 1
  assert data["paging"]["page_size"] == 15
  assert len(data["data"]) == 3
