from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from backend.app.core.db import get_db
from backend.app.api.auth import get_current_user, get_current_accountant
from backend.app.models.accountant import Accountant
from backend.app.schemas.service_fee import ServiceFeeCreate
from backend.app.schemas.bill import BillRead, BillCreate
from backend.app.services.accounting_services import AccountingService



# 2. Cập nhật Router với Global Dependency
router = APIRouter()

class CalculateRequest(BaseModel):
    month: int
    year: int
    deadline_day: int = 10
    readings: Optional[dict] = None
    overwrite: bool = False

@router.post("/service-fees", summary="1. Thiết lập đơn giá phí")
def set_service_fee(data: ServiceFeeCreate, db: Session = Depends(get_db)):
    # Đã bỏ tham số accountant vì logic Service không cần ID kế toán ở đây
    msg = AccountingService.create_or_update_fee(db, data, data.buildingID)
    return {"message": msg}

@router.post("/bills/calculate", summary="2. Tính phí tự động (Cộng dồn)")
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
            readings=payload.readings,
            overwrite=payload.overwrite # QUAN TRỌNG: Thêm tham số này
        )
        return {"status": "SUCCESS", "message": f"Đã tạo {count} hóa đơn.", "count": count}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/bills/manual", summary="3. Tạo hóa đơn lẻ (Hệ thống tự tính Total)")
def create_manual_bill(
    data: BillCreate, 
    db: Session = Depends(get_db),
    accountant: Accountant = Depends(get_current_accountant)
):
    # Ở đây data: BillCreate sẽ sử dụng logic tự gán Total = Amount nếu Total để trống
    try:
        new_bill = AccountingService.create_manual_bill(db, data, accountant.accountantID)
        return {"message": "Tạo hóa đơn thành công", "billID": new_bill.billID}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/bills", response_model=List[BillRead], summary="4. Xem danh sách hóa đơn")
def get_bills(apartment_id: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    return AccountingService.get_all_bills(db, apartment_id, status)

@router.get("/unpaid-report", summary="5. Báo cáo nợ")
def get_unpaid_report(db: Session = Depends(get_db)):
    return AccountingService.get_unpaid_summary(db)