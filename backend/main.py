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

# Import 
from backend.app.models import Base  # noqa: E402
from backend.app.core.db import get_engine  # noqa: E402
from backend.app.api import online_payments, auth, residents, apartments,accounting   # noqa: E402

def _parse_cors_origins(value: str | None) -> list[str]:
    if not value:
        return ["*"]
    origins = [item.strip() for item in value.split(",") if item.strip()]
    return origins or ["*"]


app = FastAPI(
    title="BlueMoon API",
    version="0.1.0",
)


app.include_router(auth.router, prefix="/auth")
app.include_router(online_payments.router, prefix="/payments", tags=["Payments"])
app.include_router(apartments.router, prefix="/apartments", tags=["Apartments"])
app.include_router(accounting.router) # Router mới

@app.on_event("startup")
def on_startup():
    """Test DB connection and log metadata on startup."""
    try:
        engine = get_engine()
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        print("[INFO] ✓ Database connection successful (Railway DB)")
        print(f"[INFO] Models loaded: {len(Base.metadata.tables)} tables")
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        raise


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
app.include_router(
    auth.router, 
    prefix="/api/auth", 
    tags=["Authentication"]
)  # Authentication: login, me, logout

# Online Payment Router
app.include_router(
    online_payments.router, 
    prefix="/api/payments", 
    tags=["Online Payments"]
)

# Residents and Apartments Router
app.include_router(
    residents.router, 
    prefix="/api/residents", 
    tags=["Residents"]
)

app.include_router(
    apartments.router, 
    prefix="/api/apartments", 
    tags=["Apartments"]
)

app.include_router(
    accounting.router, 
    prefix="/api/accounting", 
    tags=["Accounting"],
)