from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from backend.app.core.db import get_db
from backend.app.models.building_manager import BuildingManager
from backend.app.models.resident import Resident
from backend.app.models.accountant import Accountant
from backend.app.schemas.account import AccountCreate, AccountUpdate, AccountRead
from backend.app.core.security import create_access_token, hash_password
# Import Auth
from backend.app.api.auth import get_current_manager
from backend.app.schemas.auth import TokenData
from backend.app.models.account import Account
router = APIRouter()


@router.post("/account", response_model=AccountRead, status_code=status.HTTP_201_CREATED, summary="Tạo tài khoản mới")
def create_account(
    account_in: AccountCreate,
    db: Session = Depends(get_db),
    current_manager: TokenData = Depends(get_current_manager)
):
    """
    Tạo account mới với password được hash bằng bcrypt

    **Quyền**: Chỉ Admin/Manager

    **Errors**:
    - 403: Không có quyền tạo tài khoản
    - 400: Tài khoản đã tồn tại
    """
    exist = db.query(Account).filter(Account.username == account_in.username).first()
    #Không cho phép tạo role Admin từ API này
    if account_in.role == "Admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Không thể tạo tài khoản với quyền Admin"
        )
    if exist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Tài khoản đã tồn tại"
        )
    
    # Hash password trước khi lưu
    account_data = account_in.model_dump()
    account_data['password'] = hash_password(account_in.password)
    new_account = Account(**account_data)

    db.add(new_account)
    try:
        db.commit()
        db.refresh(new_account)
        return new_account
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lỗi tạo tài khoản: {str(e.orig)}"
        )
    
@router.delete("/{username}", status_code=status.HTTP_204_NO_CONTENT, summary="Vô hiệu hóa tài khoản")
def delete_account(
    username: str,
    db: Session = Depends(get_db),
    current_manager: TokenData = Depends(get_current_manager)
):
    """
    **Vô hiệu hóa tài khoản (Soft Delete)**
    
    - **username**: Tên đăng nhập của tài khoản cần vô hiệu hóa
    
    Thay vì xóa hẳn, tài khoản sẽ được đánh dấu isActive=False.
    Tài khoản sẽ không thể đăng nhập nhưng dữ liệu vẫn được giữ lại.
    
    **Quyền**: Chỉ Admin/Manager
    
    **Errors**:
    - 403: Không có quyền truy cập
    - 404: Tài khoản không tồn tại
    - 400: Không thể vô hiệu hóa tài khoản Admin
    """
    # Kiểm tra tài khoản có tồn tại
    account = db.query(Account).filter(Account.username == username).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tài khoản '{username}' không tồn tại"
        )
    
    # Không cho phép vô hiệu hóa tài khoản Admin
    if str(account.role) == "Admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể vô hiệu hóa tài khoản Admin"
        )
    
    # Soft delete: Đánh dấu tài khoản không còn active
    setattr(account, 'isActive', False)
    
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lỗi vô hiệu hóa tài khoản: {str(e.orig)}"
        )


@router.patch("/{username}/password", response_model=AccountRead, summary="Đổi mật khẩu")
def change_password(
    username: str,
    password_update: AccountUpdate,
    db: Session = Depends(get_db),
):
    """
    **Đổi mật khẩu cho tài khoản**
    
    - **username**: Tên đăng nhập của tài khoản cần đổi mật khẩu
    - **password**: Mật khẩu mới
    
    **Errors**:
    - 400: Mật khẩu không được cung cấp
    - 404: Tài khoản không tồn tại
    """
    if not password_update.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu mới là bắt buộc"
        )
    
    account = db.query(Account).filter(Account.username == username).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tài khoản '{username}' không tồn tại"
        )
    
    # Hash password mới trước khi cập nhật
    hashed_password = hash_password(password_update.password)
    
    if account.password == hashed_password:
            raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Mật khẩu mới phải khác với mật khẩu hiện tại"
                )
    setattr(account, 'password', hashed_password)
    
    try:
        db.commit()
        db.refresh(account)
        return account
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lỗi đổi mật khẩu: {str(e.orig)}"
        )


@router.get("/{username}", response_model=AccountRead, summary="Xem chi tiết tài khoản")
def get_account_detail(
    username: str,
    db: Session = Depends(get_db),
):
    """
    - **username**: Tên đăng nhập của tài khoản cần xem
    
    **Errors**:
    - 403: Không có quyền truy cập
    - 404: Tài khoản không tồn tại
    """
    account = db.query(Account).filter(Account.username == username).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tài khoản '{username}' không tồn tại"
        )
    
    return account
