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
random.seed("2112")
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


def get_random_image():
    return f"https://picsum.photos/seed/{random.randint(1, 10000)}/200/300"

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
        book_cover_photo=get_random_image(),
        category_id=category_id,
        author_id=author_id
    )

def gen_discount(book_id: int, book_price: Decimal) -> Discount:
    # --- Existing book_price calculation logic ---
    discount_percent = Decimal(random.uniform(10.0, 60.0))
    multiplier = (Decimal(100) - discount_percent) / Decimal(100)
    calculated_price = (book_price * multiplier).quantize(Decimal('0.01'))
    absolute_min_price = Decimal('0.99')
    discount_price = max(absolute_min_price, calculated_price)
    if discount_price >= book_price:
        discount_price = book_price - Decimal('0.01')
        discount_price = max(absolute_min_price, discount_price)
        if discount_price < 0:
             discount_price = absolute_min_price
    
    from datetime import date
    today = date.today()
    start_date_options = [
        fake.date_between(start_date="-60d", end_date="-1d"),  
        today,                                                 
        fake.future_date(end_date="+30d")
    ]
    start_date = random.choice(start_date_options)

    if start_date >= today: 
        end_date = start_date + timedelta(days=random.randint(7, 90))
    else: 
        end_date_options = [
            fake.date_between(start_date=start_date + timedelta(days=1), end_date="-1d"), 
            fake.date_between(start_date=today, end_date="+90d"),                       
            None                                                                        
        ]
        end_date = random.choice(end_date_options)

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
    session.exec(User.__table__.delete())
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
    from core.security import get_password_hash
    user_in = UserCreate(
        first_name="Tuan",
        last_name="Nguyen",
        email=settings.ADMIN_EMAIL,
        password=settings.ADMIN_PASSWORD,
        admin=True,
    )
    create_user(db_session=session, user_create=user_in)
    session.commit()

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


        
def main():
    """Main function to initialize the database and generate sample data."""
    with Session(engine) as session:
        generate_fake_data(
            session=session,
            num_authors=1000,
            num_categories=2000,
            num_books=30000,
            num_discounts=3000,
            num_reviews=50000
        )

if __name__ == "__main__":
    main()