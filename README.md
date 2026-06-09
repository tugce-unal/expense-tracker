# Expense Tracker

Full-stack harcama takip uygulaması.

## Özellikler
- Kullanıcı kaydı ve girişi (JWT)
- Harcama ekleme, silme
- Kategoriye göre pasta grafik
- CSV dışa aktarma
- Toplam harcama özeti

## Teknolojiler
**Frontend:** React, Vite, Tailwind CSS, Recharts, Axios  
**Backend:** Python, FastAPI, SQLAlchemy, SQLite

## Kurulum
### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
### Frontend
```bash
cd frontend
npm install
npm run dev
```