from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.db import get_db
from backend.app.api.auth import get_current_accountant
from backend.app.models.bill import Bill
from backend.app.models.payment_transaction import PaymentTransaction
from backend.app.models.accountant import Accountant
from backend.app.schemas.payment import OfflinePaymentRequest

router = APIRouter()


@router.post("/offline_payment", summary="Thanh toán ngoại tuyến nhiều hóa đơn")
def collect_fee_offline(
    payload: OfflinePaymentRequest,
    db: Session = Depends(get_db),
    accountant: Accountant = Depends(get_current_accountant)
):
    """
    Kế toán thanh toán nhiều hóa đơn offline.
    Backend tự tính tổng tiền từ database.
    """
    
    # Query tất cả bills
    bills = db.query(Bill).filter(Bill.billID.in_(payload.bill_ids)).all()
    
    if len(bills) != len(payload.bill_ids):
        raise HTTPException(400, "Một hoặc nhiều hóa đơn không tồn tại")
    
    # Validate và tính tổng tiền
    total_amount = 0
    for bill in bills:
        if str(bill.status) == "Paid":
            raise HTTPException(400, f"Hóa đơn {bill.billID} đã thanh toán")
        
        bill_amount = float(bill.amount) if bill.amount else 0  # type: ignore
        total_amount += bill_amount
    
    # Tạo transaction
    transaction = PaymentTransaction(
        residentID=payload.residentID,
        amount=total_amount,
        paymentMethod=payload.paymentMethod,
        paymentContent=payload.paymentContent,
        status="Success",
        payDate=datetime.now()
    )
    db.add(transaction)
    db.flush()
    
    # Cập nhật bills thành Paid
    db.query(Bill).filter(Bill.billID.in_(payload.bill_ids)).update({
        Bill.status: "Paid",
        Bill.paymentMethod: payload.paymentMethod
    }, synchronize_session=False)
    
    db.commit()
    
    return {
        "message": f"Thanh toán thành công {len(payload.bill_ids)} hóa đơn",
        "transaction_id": transaction.transID,
        "total_amount": total_amount,
        "bills_paid": len(payload.bill_ids)
    }

