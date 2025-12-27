import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

_engine = None
_SessionLocal = None


def get_db_url() -> str | None:
    """Đọc database URL trong backend/.env"""
    url = os.getenv("DB_URL")
    return url.strip() if url and url.strip() else None


def get_secret_key() -> str:
    """Lấy SECRET_KEY cho JWT từ environment variable"""
    key = os.getenv("SECRET_KEY")
    if not key:
        return get_secret_key()
    return key.strip()


def get_engine():
    """Tạo và trả về SQLAlchemy engine"""
    global _engine
    if _engine is None:
        db_url = get_db_url()
        if not db_url:
            raise RuntimeError(
                "Chưa khởi tạo giá trị cho DB_URL. cấu hình trong backend/.env"
            )
        _engine = create_engine(db_url, pool_pre_ping=True)
    return _engine


def get_sessionmaker():
    """Tạo và trả về session factory (singleton)"""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=get_engine())
    return _SessionLocal


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency để inject database session"""
    session_local = get_sessionmaker()
    db = session_local()
    try:
        yield db
    finally:
        db.close()
