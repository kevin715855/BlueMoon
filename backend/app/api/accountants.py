"""
API Router cho quản lý Accountant (Kế toán)
CRUD Kế toán
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.exc import IntegrityError

from backend.app.core.db import get_db
from backend.app.models.accountant import Accountant
from backend.app.models.bill import Bill
from backend.app.schemas.accountant import (AccountantCreate, AccountantUpdate, AccountantRead)

# Import Auth
from backend.app.api.auth import get_current_manager
from backend.app.schemas.auth import TokenData
from backend.app.models.account import Account


router = APIRouter()


@router.get("/", response_model=List[AccountantRead], summary="Lấy danh sách kế toán")
def get_accountants(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_manager: TokenData = Depends(get_current_manager)
):
    """
    **Lấy danh sách tất cả kế toán**
    """
    accountants = db.query(Accountant).offset(skip).limit(limit).all()
    return accountants


@router.get("/{accountant_id}", response_model=AccountantRead, summary="Lấy thông tin chi tiết kế toán")
def get_accountant(
    accountant_id: int,
    db: Session = Depends(get_db),
    current_manager: TokenData = Depends(get_current_manager)
):
    """
    **Lấy thông tin chi tiết một kế toán**

    **Errors**:
    - 404: Không tìm thấy kế toán
    """
    accountant = db.query(Accountant).filter(Accountant.accountantID == accountant_id).first()
    
    if not accountant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy kế toán có ID {accountant_id}"
        )
    
    return accountant


@router.post("/", response_model=AccountantRead, status_code=status.HTTP_201_CREATED, summary="Tạo kế toán mới")
def create_accountant(
    accountant_in: AccountantCreate,
    db: Session = Depends(get_db),
    current_manager: TokenData = Depends(get_current_manager)
):
    """
    **Tạo kế toán mới**

    **Errors**:
    - 400: Username không tồn tại hoặc đã được sử dụng
    """
    # Kiểm tra username
    if accountant_in.username:
        # Kiểm tra account có tồn tại không
        account = db.query(Account).filter(Account.username == accountant_in.username).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tài khoản '{accountant_in.username}' không tồn tại"
            )
        
        # Kiểm tra username đã được sử dụng chưa
        existing = db.query(Accountant).filter(
            Accountant.username == accountant_in.username
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '{accountant_in.username}' đã được gán cho kế toán khác"
            )
    
    # Tạo Accountant mới
    new_accountant = Accountant(**accountant_in.model_dump())
    db.add(new_accountant)
    
    try:
        db.commit()
        db.refresh(new_accountant)
        return new_accountant
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lỗi tạo kế toán: {str(e.orig)}"
        )


@router.patch("/{accountant_id}", response_model=AccountantRead, summary="Cập nhật thông tin kế toán")
def update_accountant(
    accountant_id: int,
    accountant_update: AccountantUpdate,
    db: Session = Depends(get_db),
    current_manager: TokenData = Depends(get_current_manager)
):
    """
    **Cập nhật thông tin kế toán**
    
    **Errors**:
    - 404: Không tìm thấy kế toán
    - 400: Username không hợp lệ
    """
    accountant = db.query(Accountant).filter(Accountant.accountantID == accountant_id).first()
    
    if not accountant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy kế toán có ID {accountant_id}"
        )
    
    # Kiểm tra username mới nếu có
    if accountant_update.username and accountant_update.username != accountant.username:
        # Kiểm tra account có tồn tại
        account = db.query(Account).filter(Account.username == accountant_update.username).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tài khoản '{accountant_update.username}' không tồn tại"
            )
        
        # Kiểm tra username đã được sử dụng chưa
        existing = db.query(Accountant).filter(
            Accountant.username == accountant_update.username
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '{accountant_update.username}' đã được gán cho kế toán khác"
            )
    
    # Cập nhật các trường
    update_data = accountant_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(accountant, field, value)
    
    try:
        db.commit()
        db.refresh(accountant)
        return accountant
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lỗi cập nhật: {str(e.orig)}"
        )


@router.delete("/{accountant_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Xóa/Vô hiệu hóa kế toán")
def delete_accountant(
    accountant_id: int,
    db: Session = Depends(get_db),
    current_manager: TokenData = Depends(get_current_manager)
):
    """
    **Xóa kế toán (Soft Delete qua Account)**
    
    - **accountant_id**: ID của kế toán cần xóa
    
    Hành động:
    1. Xóa Accountant khỏi bảng
    2. Vô hiệu hóa Account liên kết (isActive=False)
    
    **Quyền**: Admin/Manager
    
    **Errors**:
    - 404: Không tìm thấy kế toán
    - 409: Kế toán đã tạo hóa đơn, không thể xóa
    """
    accountant = db.query(Accountant).filter(Accountant.accountantID == accountant_id).first()
    
    if not accountant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy kế toán có ID {accountant_id}"
        )
    
    # Kiểm tra xem kế toán có đã tạo hóa đơn nào chưa
    bills = db.query(Bill).filter(Bill.accountantID == accountant_id).count()
    if bills > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Không thể xóa. Kế toán đã tạo {bills} hóa đơn. "
                   f"Không thể xóa để đảm bảo tính toàn vẹn dữ liệu."
        )
    
    # Vô hiệu hóa Account liên kết (nếu có)
    if accountant.username is not None:
        account = db.query(Account).filter(Account.username == accountant.username).first()
        if account:
            setattr(account, 'isActive', False)
    
    # Xóa Accountant
    try:
        db.delete(accountant)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lỗi xóa kế toán: {str(e.orig)}"
        )
