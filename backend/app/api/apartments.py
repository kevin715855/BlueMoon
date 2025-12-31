from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.db import get_db
from backend.app.models.apartment import Apartment
from backend.app.schemas.apartment import ApartmentBase
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


