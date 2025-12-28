# main.py
from fastapi import FastAPI
from dotenv import load_dotenv
from app.api import payments
load_dotenv()

app = FastAPI()

# Đăng ký router
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])

# ...