from typing import Generic, TypeVar, List, Optional, Dict
from pydantic import BaseModel

T = TypeVar('T')

class PagingInfo(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_prev: bool
    additional_detail: Optional[Dict[str,int]]

class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    paging: PagingInfo