from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.core.db import get_db
from backend.app.api.auth import get_current_user
from backend.app.models.accountant import Accountant
from backend.app.models.bill import Bill
from backend.app.schemas.service_fee import ServiceFeeCreate, ServiceFeeRead
from backend.app.schemas.bill import BillRead, BillListResponse
from backend.app.services.accounting_services import AccountingService
from pydantic import BaseModel

router = APIRouter(prefix="/accounting", tags=["Accounting"])

# Schema cho request tính phí
class CalculateRequest(BaseModel):
    month: int
    year: int
    readings: Optional[dict] = None # Chỉ số điện nước cho các căn hộ

def verify_accountant(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "Accountant":
        raise HTTPException(status_code=403, detail="Chỉ kế toán mới có quyền thực hiện")
    acc = db.query(Accountant).filter(Accountant.username == current_user.username).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin kế toán")
    return acc

@router.post("/service-fees", summary="Tạo/Cập nhật đơn giá phí")
def set_service_fee(
    data: ServiceFeeCreate, 
    db: Session = Depends(get_db),
    accountant: Accountant = Depends(verify_accountant)
):
    msg = AccountingService.create_or_update_fee(db, data)
    return {"message": msg}

@router.post("/bills/calculate", summary="Tính phí hàng tháng")
def calculate_bills(
    payload: CalculateRequest,
    db: Session = Depends(get_db),
    accountant: Accountant = Depends(verify_accountant)
):
    try:
        count = AccountingService.calculate_monthly_bills(
            db, payload.month, payload.year, accountant.accountantID, payload.readings
        )
        return {"message": f"Đã tạo thành công {count} hóa đơn cho kỳ {payload.month}/{payload.year}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bills", response_model=List[BillRead], summary="Xem danh sách hóa đơn")
def get_bills(
    apartment_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    accountant: Accountant = Depends(verify_accountant)
):
    query = db.query(Bill)
    if apartment_id:
        query = query.filter(Bill.apartmentID == apartment_id)
    if status:
        query = query.filter(Bill.status == status)
    return query.all()