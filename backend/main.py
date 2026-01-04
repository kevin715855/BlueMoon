# Load .env TRƯỚC KHI import các modules khác
import os
from pathlib import Path
from dotenv import load_dotenv

_env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=_env_path, override=False)

# Import module
from sqlalchemy import text  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from apscheduler.schedulers.background import BackgroundScheduler # noqa: E402
from backend.app.services.payment_service import PaymentService # noqa: E402

# Import 
from backend.app.models import Base  # noqa: E402
from backend.app.core.db import SessionLocal, get_engine # noqa: E402
from backend.app.api import account, online_payments, auth, residents, apartments, bills, payments, offline_payments, building_managers, accountants, receipts, buildings, accounting, notifications # noqa: E402

def _parse_cors_origins(value: str | None) -> list[str]:
    if not value:
        return ["*"]
    origins = [item.strip() for item in value.split(",") if item.strip()]
    return origins or ["*"]


app = FastAPI(
    title="BlueMoon API",
    version="0.1.0",
)

# CORS configuration
# Khi test: chỉ cần cho phép origin của frontend.
# Khi deploy: chỉ cho phép domain thật của frontend
cors_origins = _parse_cors_origins(os.getenv("CORS_ORIGINS"))
allow_all = cors_origins == ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=not allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["meta"])
def root() -> dict:
    return {"name": "BlueMoon API", "status": "ok"}


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "healthy"}


# Auth Router (Login, Register)
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])  # Authentication: login, me, logout
# Account Router
app.include_router(account.router,prefix="/api/accounts",tags=["Accounts"])
# Residents Router
app.include_router(residents.router, prefix="/api/residents", tags=["Residents"])
# Building Managers Router
app.include_router(building_managers.router, prefix="/api/building-managers", tags=["Building Managers"])
# Accountants Router
app.include_router(accountants.router, prefix="/api/accountants", tags=["Accountants"])
# Apartments Router
app.include_router(apartments.router, prefix="/api/apartments", tags=["Apartments"])
# Buildings Router
app.include_router(buildings.router, prefix="/api/buildings", tags=["Buildings"])
# Bills Router
app.include_router(bills.router, prefix="/api/bills", tags=["Bills"])
# Payment Routes
app.include_router(online_payments.router, prefix="/api/online-payments", tags=["Online Payments"])
app.include_router(offline_payments.router, prefix="/api/offline-payments", tags=["Offline Payments"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payment History"])
# Receipts Router
app.include_router(receipts.router, prefix="/api/receipts", tags=["Receipts"])
app.include_router(accounting.router, prefix="/api/accounting", tags=["Accounting"])
#Notification Router
app.include_router(notifications.router, prefix="/api/notification", tags=["Notification"])


def run_auto_cancel_job():
    """Hàm này sẽ được gọi mỗi 60 giây"""
    db = SessionLocal()
    try:
        result = PaymentService.cancel_expired_transactions(db)
        if result['canceled_count'] > 0:
            print(f"[AUTO-JOB] Đã hủy {result['canceled_count']} giao dịch quá hạn 15 phút.")
    except Exception as e:
        print(f"[AUTO-JOB ERROR] {e}")
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    """Chạy khi server khởi động"""
    try:
        engine = get_engine()
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        print("[INFO] ✓ Database connection successful (Railway DB)")
        print(f"[INFO] Models loaded: {len(Base.metadata.tables)} tables")
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
    try:
        scheduler = BackgroundScheduler()
        scheduler.add_job(run_auto_cancel_job, 'interval', minutes=1)
        scheduler.start()
        print("[INFO] --> Đã khởi động bộ quét giao dịch quá hạn.")
    except Exception as e:
        print(f"[ERROR] Không thể khởi động Scheduler: {e}")



