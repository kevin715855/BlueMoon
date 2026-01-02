from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.db import get_db
from backend.app.api.auth import get_current_accountant
from backend.app.models.meter_reading import MeterReading
from backend.app.schemas.meter_reading import MeterReadingCreate, MeterReadingRead

router = APIRouter()

@router.post("/", response_model=MeterReadingRead)
def record_meter(
    payload: MeterReadingCreate,
    db: Session = Depends(get_db),
    accountant = Depends(get_current_accountant)
):
    # Kiểm tra xem tháng này đã ghi chưa
    exist = db.query(MeterReading).filter(
        MeterReading.apartmentID == payload.apartmentID,
        MeterReading.month == payload.month,
        MeterReading.year == payload.year
    ).first()
    
    if exist:
        raise HTTPException(400, "Chỉ số tháng này đã được ghi nhận trước đó.")

    new_reading = MeterReading(
        **payload.model_dump(),
        accountantID=accountant.accountantID
    )
    db.add(new_reading)
    db.commit()
    db.refresh(new_reading)
    return new_reading

@router.get("/apartment/{apartment_id}", response_model=List[MeterReadingRead])
def get_apartment_history(apartment_id: str, db: Session = Depends(get_db)):
    return db.query(MeterReading).filter(MeterReading.apartmentID == apartment_id).order_by(MeterReading.year.desc(), MeterReading.month.desc()).all()