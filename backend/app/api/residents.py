from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.exc import IntegrityError

from backend.app.core.db import get_db
from backend.app.models.resident import Resident
from backend.app.schemas.resident import ResidentBase, ResidentCreate
from backend.app.models.apartment import Apartment
from backend.app.api.auth import get_current_accountant

router = APIRouter()

@router.get("/get-residents-data", response_model=List[ResidentBase])
def get_residents(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_accountant = Depends(get_current_accountant)
):
    """Lấy danh sách cư dân"""
    residents = db.query(Resident).offset(skip).limit(limit).all()
    return residents

@router.post("/add-new-resident", response_model=ResidentBase, status_code=status.HTTP_201_CREATED)
def create_resident(
    resident_in: ResidentCreate, 
    db: Session = Depends(get_db),
    current_accountant = Depends(get_current_accountant)
):
    apartment = db.query(Apartment).filter(Apartment.apartmentID == resident_in.apartmentID).first()
    if not apartment:
        raise HTTPException(status_code=400, detail="Căn hộ không tồn tại")

    new_resident = Resident(**resident_in.dict())
    db.add(new_resident)

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