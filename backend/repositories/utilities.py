from sqlmodel import Session, SQLModel, select
from sqlalchemy import distinct

def get_unique_values(
    session: Session,
    className: type[SQLModel],
    fieldName: str
):
    field = getattr(className, fieldName)
    query = select(distinct(field)).order_by(field)
    
    results = session.exec(query).all()
    
    return results
