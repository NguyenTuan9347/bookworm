import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session, delete
from decimal import Decimal
from datetime import date, timedelta, datetime

from models.users import User
from models.books import Book, SortByOptions, FeaturedSortOptions
from models.categories import Category
from models.authors import Author
from models.reviews import Review
from models.discounts import Discount
from core.config import settings
from controllers.deps import get_db
from main import backend

TEST_DATABASE_URL = "sqlite:///./test.db"

    
try:
    engine = create_engine(TEST_DATABASE_URL, echo=False)
    with engine.connect() as conn:
        pass
except Exception:
    print("Postgres test DB connection failed, using in-memory SQLite for tests.")
    TEST_DATABASE_URL = "sqlite:///./test.db"
    engine = create_engine(TEST_DATABASE_URL, echo=False, connect_args={"check_same_thread": False})

def get_session_override():
    with Session(engine) as session:
        yield session

@pytest.fixture(scope="session", autouse=True)
def db_setup_and_teardown():
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(scope="function", autouse=True)
def create_test_data():
    with Session(engine) as session:
        session.exec(delete(Review))
        session.exec(delete(Discount))
        session.exec(delete(Book))
        session.exec(delete(Category))
        session.exec(delete(Author))
        session.commit()

        categories = [
            Category(id=1, category_name="Test Fiction"),
            Category(id=2, category_name="Test Non-Fiction"),
            Category(id=3, category_name="Test Sci-Fi")
        ]

        authors = [
            Author(id=1, author_name="Alice Test"),
            Author(id=2, author_name="Bob Test"),
            Author(id=3, author_name="Charlie Test")
        ]

        session.add_all(categories)
        session.add_all(authors)
        session.commit()

        books = [
            Book(id=1, book_title="Alpha Book", book_price=Decimal("20.00"), category_id=1, author_id=1),
            Book(id=2, book_title="Beta Book", book_price=Decimal("50.00"), category_id=1, author_id=1),
            Book(id=3, book_title="Gamma Book", book_price=Decimal("30.00"), category_id=2, author_id=2),
            Book(id=4, book_title="Delta Book", book_price=Decimal("40.00"), category_id=2, author_id=2),
            Book(id=5, book_title="Epsilon Book", book_price=Decimal("60.00"), category_id=1, author_id=1),
            Book(id=6, book_title="Zeta Book", book_price=Decimal("25.00"), category_id=2, author_id=2),
            Book(id=7, book_title="Eta Book", book_price=Decimal("45.00"), category_id=1, author_id=3),
            Book(id=8, book_title="Theta Book", book_price=Decimal("50.00"), category_id=3, author_id=3),
            Book(id=9, book_title="Iota Book", book_price=Decimal("15.00"), category_id=1, author_id=1),
            Book(id=10, book_title="Kappa Book", book_price=Decimal("70.00"), category_id=3, author_id=3),
            Book(id=11, book_title="Lambda Book", book_price=Decimal("35.00"), category_id=1, author_id=1),
            Book(id=12, book_title="Mu Book", book_price=Decimal("35.00"), category_id=2, author_id=2)
        ]
        session.add_all(books)
        session.commit()

        today = date.today()
        discounts = [
            Discount(book_id=1, discount_price=Decimal("10.00"), discount_start_date=today-timedelta(days=1), discount_end_date=today+timedelta(days=1)),
            Discount(book_id=3, discount_price=Decimal("25.00"), discount_start_date=today, discount_end_date=today+timedelta(days=90)),
            Discount(book_id=5, discount_price=Decimal("30.00"), discount_start_date=today-timedelta(days=1), discount_end_date=today+timedelta(days=1)),
            Discount(book_id=7, discount_price=Decimal("35.00"), discount_start_date=today-timedelta(days=1), discount_end_date=today+timedelta(days=90)),
            Discount(book_id=10, discount_price=Decimal("65.00"), discount_start_date=today, discount_end_date=today+timedelta(days=1)),
            Discount(book_id=2, discount_price=Decimal("40.00"), discount_start_date=today+timedelta(days=1), discount_end_date=today+timedelta(days=90)),
            Discount(book_id=8, discount_price=Decimal("40.00"), discount_start_date=today-timedelta(days=90), discount_end_date=today-timedelta(days=1))
        ]
        session.add_all(discounts)

        now = datetime.now()
        reviews = [
            Review(book_id=1, rating_start=5, review_title="Excellent", review_date=now-timedelta(days=10)),
            Review(book_id=1, rating_start=4, review_title="Very Good", review_date=now-timedelta(days=5)),
            Review(book_id=2, rating_start=3, review_title="Okay", review_date=now-timedelta(days=20)),
            Review(book_id=3, rating_start=5, review_title="Perfect!", review_date=now-timedelta(days=15)),
            Review(book_id=3, rating_start=5, review_title="Still perfect", review_date=now-timedelta(days=1)),
            Review(book_id=5, rating_start=5, review_title="Amazing B5", review_date=now-timedelta(days=2)),
            Review(book_id=6, rating_start=4, review_title="Good B6", review_date=now-timedelta(days=3)),
            Review(book_id=7, rating_start=4, review_title="Solid B7", review_date=now-timedelta(days=4)),
            Review(book_id=7, rating_start=4, review_title="Consistent B7", review_date=now-timedelta(days=1)),
            Review(book_id=11, rating_start=3, review_title="Meh B11", review_date=now-timedelta(days=6)),
            Review(book_id=12, rating_start=1, review_title="Poor B12", review_date=now-timedelta(days=7))
        ]
        session.add_all(reviews)
        session.commit()

@pytest.fixture(scope="module")
def client():
    with TestClient(backend) as c:
        c.app.dependency_overrides[get_db] = get_session_override
        yield c

def test_get_book(client):
    res = client.get("/book/1")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == 1

    assert client.get("/book/9999").status_code == 404
    assert client.get("/book/abc").status_code == 422
    assert client.get("/book/0").status_code == 422

def test_list_books_default(client):
    res = client.get("/books?page_size=20")
    assert res.status_code == 200
    data = res.json()
    assert len(data["data"]) == 12
    expected_ids = [5,1, 7, 3, 10, 9, 6, 11, 12, 4, 2, 8]
    assert [b["id"] for b in data["data"]] == expected_ids

@pytest.mark.parametrize("params,expected_ids", [
    ("sort_by=on_sale", [5,1, 7, 3, 10, 9, 6, 11, 12, 4, 2, 8]),
    ("sort_by=popularity", [1, 3, 7, 6, 5, 11, 12, 2, 9, 4, 8, 10]),
    ("sort_by=price_asc", [1, 9, 3, 6, 5, 7, 11, 12, 4, 2, 8, 10]),
    ("sort_by=price_desc", [10, 2, 8, 4, 7, 11, 12, 5, 3, 6, 9, 1]),
    ("category=Test Fiction", [5, 1, 7, 9, 11, 2]),
    ("author=Alice Test", [5, 1, 9, 11, 2]),
    ("min_rating=4", [5, 1, 7, 3, 6]),
    ("category=Test Fiction&sort_by=price_asc", [1, 9, 5, 7, 11, 2]),
])
def test_list_books_filters(client, params, expected_ids):
    res = client.get(f"/books?{params}&page_size=20")
    assert res.status_code == 200
    data = res.json()
    assert "data" in data
    assert [b["id"] for b in data["data"]] == expected_ids

def test_list_most_discounted_books(client):
    res = client.get("/books/top-discounted")
    assert res.status_code == 200
    expected_default_k = [5, 1, 7, 3, 10]
    assert [b["id"] for b in res.json()] == expected_default_k

    res_custom = client.get("/books/top-discounted?top_k=3")
    assert res_custom.status_code == 200
    expected_top_3 = [5, 1, 7]
    assert [b["id"] for b in res_custom.json()] == expected_top_3

def test_list_featured_books(client):
    res_rec = client.get("/books/featured?sort_by=recommended")
    assert res_rec.status_code == 200
    expected_recommended = [3, 5, 1, 6, 7, 11, 2, 12]
    assert [b["id"] for b in res_rec.json()] == expected_recommended

    res_pop = client.get("/books/featured?sort_by=popular")
    assert res_pop.status_code == 200
    expected_popular = [1, 3, 7, 6, 5, 11, 12, 2]
    assert [b["id"] for b in res_pop.json()] == expected_popular