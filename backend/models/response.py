from typing import Generic, TypeVar, List
from pydantic import BaseModel

T = TypeVar('T')

class ListPayload(BaseModel, Generic[T]):
  data: List[T]
  type: str