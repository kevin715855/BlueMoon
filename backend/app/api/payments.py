from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.db import get_db
from backend.app.schemas.payment import PaymentTransactionCreate, SePayWebhookPayload
from backend.app.services.payment_service import PaymentService

# Import Auth
from app.api.auth import get_current_user
from app.schemas.auth import TokenData
from app.models.account import Account
router = APIRouter()

@router.post("/create-qr", summary="Create QR")
def create_qr_code(
    payload: PaymentTransactionCreate,
    db: Session = Depends(get_db),
    token_data: TokenData = Depends(get_current_user)
):
    
    user = db.query(Account).filter(Account.username == token_data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Không tìm thấy thông tin tài khoản"
        )
    
    return PaymentService.create_qr_transaction(
        db=db,
        user_id=user.residentID,
        bill_ids=payload.bill_ids
    )

@router.post("/sepay-webhook", summary="Get Webhook from SePay")
def receive_sepay_webhook(
    payload: SePayWebhookPayload,
    db: Session = Depends(get_db)
):
    data = payload.transaction

    return PaymentService.process_sepay_webhook(
        db=db,
        content=data.transaction_content,      # Nội dung CK 
        amount_in=float(data.amount_in),       # Số tiền nhận được
        gateway_id=str(data.id),               # ID giao dịch phía SePay
        transaction_date=data.transaction_date # Ngày giờ giao dịch
    )