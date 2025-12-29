from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.db import get_db
from backend.app.models.apartment import Apartment
from backend.app.schemas.apartment import ApartmentCreate, ApartmentBase
from backend.app.api.auth import get_current_accountant

router = APIRouter()

@router.get("/get-apartments-data", response_model=List[ApartmentBase])
def get_apartments(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_accountant = Depends(get_current_accountant)
):
    """Lấy danh sách căn hộ"""
    apartments = db.query(Apartment).offset(skip).limit(limit).all()
    return apartments

@router.post("/add-new-apartment", response_model=ApartmentBase, status_code=status.HTTP_201_CREATED)
def create_apartment(
    apartment_in: ApartmentCreate, 
    db: Session = Depends(get_db),
    current_accountant = Depends(get_current_accountant)
):
    """Thêm mới một căn hộ"""
    existing_apt = db.query(Apartment).filter(Apartment.apartmentID == apartment_in.apartmentID).first()
    if existing_apt:
        raise HTTPException(status_code=400, detail="Căn hộ này đã tồn tại")

    new_apartment = Apartment(**apartment_in.dict())
    db.add(new_apartment)
    db.commit()
    db.refresh(new_apartment)
    return new_apartment


