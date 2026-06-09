from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import auth, expenses
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")



@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print("VALIDATION ERROR:", exc.errors())
    return JSONResponse(status_code=422, content={"detail": exc.errors()})



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(expenses.router)

@app.get("/")
def root():
    return {"message": "Expense Tracker API çalışıyor!"}