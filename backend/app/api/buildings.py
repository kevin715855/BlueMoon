"""
API Router cho quản lý Building (Tòa nhà)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from backend.app.core.db import get_db
from backend.app.models.building import Building
from backend.app.models.building_manager import BuildingManager
from backend.app.schemas.building import BuildingRead, BuildingUpdate
from backend.app.api.auth import get_current_manager, get_only_admin
from backend.app.schemas.auth import TokenData

router = APIRouter()


@router.get("/manager/{manager_id}", response_model=List[BuildingRead], summary="Xem danh sách tòa nhà đang quản lý")
def get_manager_buildings(
    manager_id: int,
    db: Session = Depends(get_db),
    current_manager: TokenData = Depends(get_current_manager)
):
    """
    **Xem danh sách tòa nhà mà một quản lý đang phụ trách**
    
    - **manager_id**: ID của quản lý
    
    **Quyền**: Admin/Manager
    
    **Errors**:
    - 404: Không tìm thấy quản lý
    """
    # Kiểm tra manager có tồn tại không
    manager = db.query(BuildingManager).filter(BuildingManager.managerID == manager_id).first()
    
    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy quản lý có ID {manager_id}"
        )
    
    # Lấy danh sách tòa nhà
    buildings = db.query(Building).filter(Building.managerID == manager_id).all()
    
    return buildings


@router.patch("/{building_id}/manager", response_model=BuildingRead, summary="Cập nhật quản lý cho tòa nhà")
def update_building_manager_assignment(
    building_id: str,
    manager_id: int | None = None,
    db: Session = Depends(get_db),
    admin: TokenData = Depends(get_only_admin)
):
    """
    **Cập nhật/Thay đổi quản lý phụ trách cho một tòa nhà**
    
    - **building_id**: Mã tòa nhà cần cập nhật
    - **manager_id**: ID quản lý mới (None để bỏ quản lý)
    
    **Quyền**: Admin/Manager
    
    **Errors**:
    - 404: Không tìm thấy tòa nhà hoặc quản lý
    """
    # Kiểm tra building có tồn tại không
    building = db.query(Building).filter(Building.buildingID == building_id).first()
    
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy tòa nhà '{building_id}'"
        )
    
    # Nếu manager_id không phải None, kiểm tra manager có tồn tại không
    if manager_id is not None:
        manager = db.query(BuildingManager).filter(BuildingManager.managerID == manager_id).first()
        
        if not manager:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy quản lý có ID {manager_id}"
            )
    
    # Cập nhật managerID cho building
    setattr(building, 'managerID', manager_id)
    
    try:
        db.commit()
        db.refresh(building)
        return building
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lỗi cập nhật: {str(e.orig)}"
        )
