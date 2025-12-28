from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.app.core.db import get_db
from backend.app.core.security import create_access_token, decode_access_token
from backend.app.models.account import Account
from backend.app.schemas.auth import LoginRequest, LoginResponse, MeResponse, TokenData

router = APIRouter()
security = HTTPBearer()


@router.post("/login", response_model=LoginResponse, summary="Đăng nhập")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    """
    **Errors**:
    -400: Thiếu username hoặc password
    -401: Username hoặc password không đúng
    """

    # Validate input
    if not payload.username or not payload.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username và password là bắt buộc"
        )

    # Query user từ db để kiểm tra
    user = db.query(Account).filter(
        Account.username == payload.username,
        Account.password == payload.password
    ).first()

    # Không có user
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username hoặc mật khẩu không đúng",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Tạo JWT token
    access_token = create_access_token(
        username=str(user.username),
        role=str(user.role)
    )

    # Trả về response
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        username=str(user.username),
        role=str(user.role)
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """
    Muốn lấy thông tin user hiện tại từ JWT token, sử dụng dependency này.

    Err `401`: Token không hợp lệ hoặc đã hết hạn
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn",
            headers={"WWW-Authenticate": "Bearer"}
        )

    username = payload.get("username")
    role = payload.get("role")

    if not username or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return TokenData(username=username, role=role)


@router.get("/me", response_model=MeResponse, summary="Lấy thông tin user hiện tại")
def get_me(current_user: TokenData = Depends(get_current_user)) -> MeResponse:
    """
    Lấy thông tin của user hiện tại (đã auth)

    Trả về username và role.
    """
    return MeResponse(
        username=current_user.username,
        role=current_user.role
    )
