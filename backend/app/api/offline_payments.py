from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.api.auth import get_current_user
from app.models.account import Account
from app.models.accountant import Accountant
from app.models.bill import Bill
from app.models.payment_transaction import PaymentTransaction
from app.schemas.payment import OfflinePaymentRequest

@router.post("/offline_payment", summary="Xử lý thanh toán ngoại tuyến")
def collect_fee_offline(
    payload: OfflinePaymentRequest,
    db: Session = Depends(get_db),
    token_data: TokenData = Depends(get_current_user)
):
    
    # 1. Lấy tài khoản đăng nhập
    account = db.query(Account)\
        .filter(Account.username == token_data.username)\
        .first()

    if not account:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND, 
            detail="Không tìm thấy thông tin tài khoản"
        )
    
    # 2. Kiểm tra quyền kế toán
    accountant = db.query(Accountant)\
        .filter(Accountant.account_id == account.id)\
        .first()
    
    if not accountant:
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN, 
            detail="Tài khoản không có quyền thực hiện thao tác này"
        )

    # 3. Lấy hóa đơn cần thu
    bill = db.query(Bill)\
        .filter(Bill.id == payload.bill_id)\
        .first()
    
    if not bill or bill.status == "Paid":
        raise HTTPException(
            status_code  = status.HTTP_400_BAD_REQUEST, 
            detail = "Hóa đơn không hợp lệ hoặc đã được thanh toán",
        )

    # 4. Kiểm tra số tiền
    if payload.amount <= 0 or payload.amount > bill.amount_due:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST, 
            detail="Số tiền thanh toán không hợp lệ"
        )
    
    # 5. Lưu giao dịch
    transaction = OfflinePaymentTransaction(
        accountant_id = accountant.id,
        apartment_id = bill.apartment_id,
        total_amount = payload.amount,
        payment_date = payload.payment_date
    )
    db.add(transaction)

    # 6. Trừ nợ
    bill.amount_due -= payload.amount
    if bill.amount_due == 0:
        bill.status = "Paid"
        
    db.commit()
    db.refresh(transaction)

    return {
        "message": "Thanh toán ngoại tuyến thành công",
        "transactino_id": transaction.id
    }
