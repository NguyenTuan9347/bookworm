from faker import Faker
import random
from datetime import datetime, timedelta
from typing import List, Tuple
from decimal import Decimal

from sqlmodel import Session, create_engine, select
from core.config import settings
from models.users import User, UserCreate
from models.authors import Author, AuthorCreate
from models.categories import Category, CategoryCreate
from models.books import Book, BookCreate
from repositories.users import create_user
from models.discounts import Discount, DiscountCreate
from models.reviews import Review, ReviewCreate  # Import the new models

fake = Faker()

def gen_author(fake: Faker = fake) -> AuthorCreate:
    """Generate a single author with Faker data"""
    return AuthorCreate(author_name=fake.name(), author_bio=fake.text(max_nb_chars=500))

def gen_category(fake: Faker = fake) -> CategoryCreate:
    """Generate a single category with Faker data"""
    return CategoryCreate(
        category_name=fake.word().title(),
        category_desc=fake.sentence()
    )

def gen_book(author_id: int, category_id: int) -> BookCreate:
    """Generate a BookCreate instance with proper relationships"""
    return BookCreate(
        book_title=fake.catch_phrase(),
        book_summary=fake.text(max_nb_chars=1000),
        book_price=fake.pydecimal(
            left_digits=2, 
            right_digits=2,
            positive=True,
            min_value=5,
            max_value=50
        ),
        book_cover_photo=fake.image_url() if random.random() < 0.5 else None,
        category_id=category_id,
        author_id=author_id
    )

def gen_discount(book_id: int, book_price: Decimal) -> Discount:
    """Generate a Discount instance with valid book relationship"""
    # Calculate discounted price
    discount_percent = random.choice([10, 15, 20, 25, 30])
    multiplier = Decimal(100 - discount_percent) / 100
    discount_price = book_price * multiplier
    discount_price = discount_price.quantize(Decimal("0.01"))
    
    # Generate valid date range
    start_date = fake.future_date(end_date="+30d")
    end_date = start_date + timedelta(days=random.randint(7, 60))

    return Discount(
        book_id=book_id,
        discount_start_date=start_date,
        discount_end_date=end_date,
        discount_price=discount_price
    )

def gen_review(book_id: int) -> ReviewCreate:
    """Generate a ReviewCreate instance for a given book"""
    return ReviewCreate(
        book_id=book_id,
        review_title=fake.sentence(nb_words=6),
        review_details=fake.text(max_nb_chars=500) if random.random() < 0.8 else None,
        rating_start=random.randint(1, 5),
        review_date=fake.date_time_between(start_date="-1y", end_date="now")
    )

def clear_database(session: Session):
    """Clear all data from the database"""
    print("Clearing database...")
    # Delete all records from each table in reverse order of dependency
    session.exec(Review.__table__.delete())
    session.exec(Discount.__table__.delete())
    session.exec(Book.__table__.delete())
    session.exec(Category.__table__.delete())
    session.exec(Author.__table__.delete())
    session.exec(User.__table__.delete().where(User.email != settings.ADMIN_EMAIL))
    session.commit()
    print("Database cleared successfully!")

def generate_fake_data(
    session: Session,
    num_authors: int = 10,
    num_categories: int = 5,
    num_books: int = 100,
    num_discounts: int = 20,
    num_reviews: int = 200
) -> None:
    """
    Main generation function that creates and persists data with proper relationships
    """
    # Clear existing data first
    clear_database(session)
    
    print(f"Generating {num_authors} authors...")
    # Create and persist authors
    authors = []
    for _ in range(num_authors):
        author_create = gen_author()
        author = Author.model_validate(author_create)
        session.add(author)
        authors.append(author)
    
    session.commit()  # SQLModel will populate the IDs after commit
    
    print(f"Generating {num_categories} categories...")
    # Create and persist categories
    categories = []
    for _ in range(num_categories):
        category_create = gen_category()
        category = Category.model_validate(category_create)
        session.add(category)
        categories.append(category)
    
    session.commit()  # SQLModel will populate the IDs after commit
    
    print(f"Generating {num_books} books...")
    # Create and persist books
    books = []
    for _ in range(num_books):
        author = random.choice(authors)
        category = random.choice(categories)
        book_create = gen_book(author.id, category.id)
        book = Book.model_validate(book_create)
        session.add(book)
        books.append(book)
    
    session.commit()  # SQLModel will populate the IDs after commit
    
    print(f"Generating {num_discounts} discounts...")
    # Create and persist discounts - directly create Discount objects
    for _ in range(min(num_discounts, len(books))):
        book = random.choice(books)
        discount = gen_discount(book.id, book.book_price)
        session.add(discount)
    
    session.commit()
    
    print(f"Generating {num_reviews} reviews...")
    # Create and persist reviews
    for _ in range(num_reviews):
        book = random.choice(books)
        review_create = gen_review(book.id)
        review = Review.model_validate(review_create)
        session.add(review)
    
    session.commit()
    
    print("Data generation completed successfully!")

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)

def init_db(session: Session) -> None:
    """Initialize the database with the admin user if it doesn't exist."""
    user = session.exec(
        select(User).where(User.email == settings.ADMIN_EMAIL)
    ).first()
    if not user:
        from core.security import get_password_hash
        user_in = UserCreate(
            first_name="admin",
            last_name="admin",
            email=settings.ADMIN_EMAIL,
            password=get_password_hash(settings.ADMIN_PASSWORD),
            admin=True,
        )
        create_user(db_session=session, user_create=user_in)
        session.commit()

def main():
    """Main function to initialize the database and generate sample data."""
    with Session(engine) as session:
        init_db(session)
        generate_fake_data(
            session=session,
            num_authors=50,
            num_categories=20,
            num_books=800,
            num_discounts=100,
            num_reviews=2000  # Added parameter for reviews
        )

if __name__ == "__main__":
    main()