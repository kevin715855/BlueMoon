from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.exc import IntegrityError

from backend.app.models.resident import Resident
from backend.app.schemas.resident import ResidentBase, ResidentCreate, ResidentRead, ResidentUpdate
from backend.app.models.apartment import Apartment

from backend.app.core.db import get_db
from backend.app.api.auth import get_current_accountant, get_only_admin, get_current_manager

router = APIRouter()

@router.get("/get-residents-data", response_model=List[ResidentRead])
def get_residents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    manager = Depends(get_current_manager)
):
    """Lấy danh sách cư dân"""
    residents = db.query(Resident).offset(skip).limit(limit).all()
    return residents

@router.post("/add-new-resident", response_model=ResidentBase, status_code=status.HTTP_201_CREATED)
def create_resident(
    resident_in: ResidentCreate, 
    db: Session = Depends(get_db),    
    manager = Depends(get_current_manager)
):
    apartment = db.query(Apartment).filter(Apartment.apartmentID == resident_in.apartmentID).first()
    if not apartment:
        raise HTTPException(status_code=400, detail="Căn hộ không tồn tại")

    new_resident = Resident(**resident_in.dict())
    db.add(new_resident)

    current_count = apartment.numResident if apartment.numResident else 0
    apartment.numResident = current_count + 1

    try:
        db.commit()
        db.refresh(new_resident)
        return new_resident

    except IntegrityError as e:
        db.rollback()

        print(f"DEBUG ERROR: {e}")
        error_msg = str(e.orig)
        if "FK_Resident_User" in error_msg:
             raise HTTPException(
                 status_code=400,
                 detail=f"Tài khoản '{resident_in.username}' chưa tồn tại. Vui lòng tạo tài khoản trước."
             )

        raise HTTPException(status_code=400, detail=f"Lỗi Database: {error_msg}")

@router.get("/resident_detail", response_model=ResidentRead)
def get_resident_detail(
    fullname: str,
    apartment_id: str,
    db: Session = Depends(get_db),
    manager = Depends(get_current_manager)
):
    resident = db.query(Resident).filter(
        Resident.apartmentID==apartment_id,
        Resident.fullName==fullname
    ).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Không tìm thấy cư dân")

    return resident


@router.put("/{id}", response_model=ResidentRead)
def update_resident(
    id: int,
    resident_in: ResidentUpdate,
    db: Session = Depends(get_db),
    manager = Depends(get_current_manager)
):
    resident = db.query(Resident).filter(Resident.residentID == id).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Không tìm thấy cư dân")

    update_data = resident_in.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(resident, key, value)

    try:
        db.commit()
        db.refresh(resident)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Cập nhật thất bại.Thông tin bị trùng lặp."
        )

    return resident

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resident(
    id: int,
    db: Session = Depends(get_db),
    manager = Depends(get_current_manager)
):
    resident = db.query(Resident).filter(Resident.residentID == id).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Không tìm thấy cư dân")
    
    apartment = db.query(Apartment).filter(Apartment.apartmentID == resident.apartmentID).first()
    
    if apartment and apartment.numResident > 0:
        apartment.numResident -= 1

    db.delete(resident)
    db.commit()
    return None
