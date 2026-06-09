from pydantic import BaseModel
from typing import Optional
from datetime import date

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    date: Optional[str] = None

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    date: date
    owner_id: int

    class Config:
        from_attributes = True