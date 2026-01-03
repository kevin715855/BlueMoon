from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from backend.app.core.db import get_db
from backend.app.api.auth import get_current_accountant
from backend.app.models.accountant import Accountant
from backend.app.schemas.service_fee import ServiceFeeCreate
from backend.app.schemas.bill import BillRead, BillCreate
from backend.app.services.accounting_services import AccountingService

class MeterReadingCreate(BaseModel):
    apartmentID: str
    month: int
    year: int
    oldElectricity: float
    newElectricity: float
    oldWater: float
    newWater: float

class CalculateRequest(BaseModel):
    month: int
    year: int
    deadline_day: int = 10
    overwrite: bool = False

router = APIRouter()

@router.post("/meter-readings", summary="0. Nhập chỉ số điện nước (Dữ liệu nguồn)")
def record_meter_reading(data: MeterReadingCreate, db: Session = Depends(get_db), accountant: Accountant = Depends(get_current_accountant)):
    from backend.app.models.meter_reading import MeterReading
    
    db.query(MeterReading).filter(
        MeterReading.apartmentID == data.apartmentID,
        MeterReading.month == data.month,
        MeterReading.year == data.year
    ).delete()

    new_reading = MeterReading(
        **data.dict(),
        accountantID=accountant.accountantID
    )
    db.add(new_reading)
    db.commit()
    return {"message": f"Đã nhập chỉ số cho căn hộ {data.apartmentID}"}

@router.post("/service-fees", summary="1. Thiết lập đơn giá phí")
def set_service_fee(data: ServiceFeeCreate, db: Session = Depends(get_db)):
    msg = AccountingService.create_or_update_fee(db, data, data.buildingID)
    return {"message": msg}

@router.post("/bills/calculate", summary="2. Tính phí (3 luồng: Điện, Nước, Dịch vụ)")
def calculate_bills(
    payload: CalculateRequest,
    db: Session = Depends(get_db),
    accountant: Accountant = Depends(get_current_accountant)
):
    try:
        count = AccountingService.calculate_monthly_bills(
            db=db, 
            month=payload.month, 
            year=payload.year, 
            accountant_id=accountant.accountantID, 
            deadline_day=payload.deadline_day, 
            overwrite=payload.overwrite
        )
        return {"status": "SUCCESS", "message": f"Đã tạo {count} hóa đơn và gửi thông báo.", "count": count}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/bills/manual", summary="4. Tạo hóa đơn lẻ")
def create_manual_bill(
    data: BillCreate, 
    db: Session = Depends(get_db),
    accountant: Accountant = Depends(get_current_accountant)
):
    try:
        new_bill = AccountingService.create_manual_bill(db, data, accountant.accountantID)
        return {"message": "Tạo hóa đơn thành công", "billID": new_bill.billID}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/bills", response_model=List[BillRead], summary="5. Xem danh sách hóa đơn")
def get_bills(apartment_id: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    return AccountingService.get_all_bills(db, apartment_id, status)