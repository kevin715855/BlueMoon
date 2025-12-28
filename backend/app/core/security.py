"""
Security utilities: JWT authentication
"""
from datetime import datetime, timedelta
from jose import JWTError, jwt
from backend.app.core.db import get_secret_key

# JWT Configuration
SECRET_KEY = get_secret_key()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


def create_access_token(username: str, role: str) -> str:
    """
    Tạo JWT token cho user
    Returns:
        JWT token string
    """
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "username": username,
        "role": role,
        "exp": expire
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token


def decode_access_token(token: str) -> dict | None:
    """
    Decode và verify JWT token
    Trả về Dict chứa username và role nếu token hợp lệ, None nếu invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
