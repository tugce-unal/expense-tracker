from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from typing import List
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
import csv
import io
import datetime

router = APIRouter(prefix="/expenses", tags=["expenses"])

SECRET_KEY = "expense-gizli-anahtar"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user_id(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Geçersiz token")

@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return db.query(Expense).filter(Expense.owner_id == user_id).order_by(Expense.date.desc()).all()

@router.post("/", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    import datetime
    date_value = datetime.date.fromisoformat(expense.date) if expense.date else datetime.date.today()
    new_expense = Expense(
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        date=date_value,
        owner_id=user_id
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.patch("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, expense: ExpenseUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_expense = db.query(Expense).filter(Expense.id == expense_id, Expense.owner_id == user_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Harcama bulunamadı")
    for key, value in expense.dict(exclude_none=True).items():
        setattr(db_expense, key, value)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_expense = db.query(Expense).filter(Expense.id == expense_id, Expense.owner_id == user_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Harcama bulunamadı")
    db.delete(db_expense)
    db.commit()
    return {"message": "Harcama silindi"}

@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    expenses = db.query(Expense).filter(Expense.owner_id == user_id).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Başlık", "Miktar", "Kategori", "Tarih"])
    for e in expenses:
        writer.writerow([e.title, e.amount, e.category, e.date])
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8-sig")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=harcamalar.csv"}
    )

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    expenses = db.query(Expense).filter(Expense.owner_id == user_id).all()
    total = sum(e.amount for e in expenses)
    by_category = {}
    for e in expenses:
        by_category[e.category] = by_category.get(e.category, 0) + e.amount
    return {"total": total, "by_category": by_category}