"""
Security utilities: JWT authentication & Password hashing
"""
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from backend.app.core.db import get_secret_key

# JWT Configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


def hash_password(password: str) -> str:
    """
    Hash password bằng bcrypt
    
    Args:
        password: Plain text password
    
    Returns:
        Hashed password string
    """
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password với hash
    
    Args:
        plain_password: Plain text password from user input
        hashed_password: Hashed password from database
    
    Returns:
        True nếu password đúng, False nếu sai
    """
    try:
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False


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
