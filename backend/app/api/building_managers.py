"""
API Router cho quản lý Building Manager
CRUD operations: Create, Read, Update, Delete
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from backend.app.core.db import get_db
from backend.app.models.building_manager import BuildingManager
from backend.app.models.account import Account
from backend.app.models.building import Building
from backend.app.schemas.building import (
    BuildingManagerCreate,
    BuildingManagerUpdate,
    BuildingManagerRead
)
from backend.app.api.auth import get_current_manager
from backend.app.schemas.auth import TokenData

router = APIRouter()


@router.get("/", response_model=List[BuildingManagerRead], summary="Lấy danh sách quản lý tòa nhà")
def get_building_managers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_manager: TokenData = Depends(get_current_manager)
):
    """
    **Lấy danh sách tất cả quản lý tòa nhà**
    
    - **skip**: Số bản ghi bỏ qua (phân trang)
    - **limit**: Số bản ghi tối đa trả về
    
    **Quyền**: Admin/Manager
    """
    managers = db.query(BuildingManager).offset(skip).limit(limit).all()
    return managers


@router.get("/{manager_id}", response_model=BuildingManagerRead, summary="Lấy thông tin chi tiết quản lý")
def get_building_manager(
    manager_id: int,
    db: Session = Depends(get_db),
    current_manager: TokenData = Depends(get_current_manager)
):
    """
    **Lấy thông tin chi tiết một quản lý tòa nhà**
    
    - **manager_id**: ID của quản lý
    
    **Quyền**: Admin/Manager
    
    **Errors**:
    - 404: Không tìm thấy quản lý
    """
    manager = db.query(BuildingManager).filter(BuildingManager.managerID == manager_id).first()
    
    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy quản lý có ID {manager_id}"
        )
    
    return manager


@router.post("/", response_model=BuildingManagerRead, status_code=status.HTTP_201_CREATED, summary="Tạo quản lý tòa nhà mới")
def create_building_manager(
    manager_in: BuildingManagerCreate,
    db: Session = Depends(get_db),
    current_manager: TokenData = Depends(get_current_manager)
):
    """
    **Tạo quản lý tòa nhà mới**
    
    - **name**: Tên quản lý (bắt buộc)
    - **phoneNumber**: Số điện thoại (10-15 chữ số)
    - **username**: Username liên kết (phải tồn tại trong ACCOUNT)
    
    **Quyền**: Admin/Manager
    
    **Errors**:
    - 400: Username đã được sử dụng hoặc không tồn tại
    """
    # Kiểm tra username nếu có
    if manager_in.username:
        # Kiểm tra account có tồn tại không
        account = db.query(Account).filter(Account.username == manager_in.username).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tài khoản '{manager_in.username}' không tồn tại"
            )
        
        # Kiểm tra username đã được sử dụng chưa
        existing = db.query(BuildingManager).filter(
            BuildingManager.username == manager_in.username
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '{manager_in.username}' đã được gán cho quản lý khác"
            )
    
    # Tạo BuildingManager mới
    new_manager = BuildingManager(**manager_in.model_dump())
    db.add(new_manager)
    
    try:
        db.commit()
        db.refresh(new_manager)
        return new_manager
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lỗi tạo quản lý: {str(e.orig)}"
        )


@router.patch("/{manager_id}", response_model=BuildingManagerRead, summary="Cập nhật thông tin quản lý")
def update_building_manager(
    manager_id: int,
    manager_update: BuildingManagerUpdate,
    db: Session = Depends(get_db),
    current_manager: TokenData = Depends(get_current_manager)
):
    """
    **Cập nhật thông tin quản lý tòa nhà**
    
    - **manager_id**: ID của quản lý cần cập nhật
    - **name**: Tên mới (nếu muốn đổi)
    - **phoneNumber**: Số điện thoại mới
    - **username**: Username mới
    
    **Quyền**: Admin/Manager
    
    **Errors**:
    - 404: Không tìm thấy quản lý
    - 400: Username không hợp lệ
    """
    manager = db.query(BuildingManager).filter(BuildingManager.managerID == manager_id).first()
    
    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy quản lý có ID {manager_id}"
        )
    
    # Kiểm tra username mới nếu có
    if manager_update.username and manager_update.username != manager.username:
        # Kiểm tra account có tồn tại
        account = db.query(Account).filter(Account.username == manager_update.username).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tài khoản '{manager_update.username}' không tồn tại"
            )
        
        # Kiểm tra username đã được sử dụng chưa
        existing = db.query(BuildingManager).filter(
            BuildingManager.username == manager_update.username
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '{manager_update.username}' đã được gán cho quản lý khác"
            )
    
    # Cập nhật các trường
    update_data = manager_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(manager, field, value)
    
    try:
        db.commit()
        db.refresh(manager)
        return manager
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lỗi cập nhật: {str(e.orig)}"
        )


@router.delete("/{manager_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Xóa/Vô hiệu hóa quản lý tòa nhà")
def delete_building_manager(
    manager_id: int,
    db: Session = Depends(get_db),
    current_manager: TokenData = Depends(get_current_manager)
):
    """
    **Xóa quản lý tòa nhà (Soft Delete qua Account)**
    
    - **manager_id**: ID của quản lý cần xóa
    
    Hành động:
    1. Xóa BuildingManager khỏi bảng
    2. Vô hiệu hóa Account liên kết (isActive=False)
    
    **Quyền**: Admin/Manager
    
    **Errors**:
    - 404: Không tìm thấy quản lý
    - 409: Quản lý đang quản lý tòa nhà, không thể xóa
    """
    manager = db.query(BuildingManager).filter(BuildingManager.managerID == manager_id).first()
    
    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy quản lý có ID {manager_id}"
        )
    
    # Kiểm tra xem quản lý có đang quản lý tòa nhà nào không
    buildings = db.query(Building).filter(Building.managerID == manager_id).all()
    if buildings:
        building_ids = [str(b.buildingID) for b in buildings]
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Không thể xóa. Quản lý đang phụ trách {len(buildings)} tòa nhà: {', '.join(building_ids)}. "
                   f"Vui lòng chuyển quản lý sang người khác trước."
        )
    
    # Vô hiệu hóa Account liên kết (nếu có)
    if manager.username is not None:
        account = db.query(Account).filter(Account.username == manager.username).first()
        if account:
            setattr(account, 'isActive', False)
    
    # Xóa BuildingManager
    try:
        db.delete(manager)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lỗi xóa quản lý: {str(e.orig)}"
        )
