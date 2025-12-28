"""
Security utilities: JWT authentication
"""
from datetime import datetime, timedelta
from jose import JWTError, jwt
from backend.app.core.db import get_secret_key

# JWT Configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


def create_access_token(username: str, role: str) -> str:
    """
    Tạo JWT token cho user
    Trả về chuỗi JWT token
    """
    secret_key = get_secret_key()  # Lazy load
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "username": username,
        "role": role,
        "exp": expire
    }
    token = jwt.encode(payload, secret_key, algorithm=ALGORITHM)
    return token


def decode_access_token(token: str) -> dict | None:
    """
    Decode và verify JWT token
    Trả về Dict chứa username và role nếu token hợp lệ, None nếu invalid
    """
    try:
        secret_key = get_secret_key()  # Lazy load
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
