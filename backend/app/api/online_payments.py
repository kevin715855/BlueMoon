from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.db import get_db
from backend.app.schemas.payment import PaymentCreateRequest, SePayWebhookPayload
from backend.app.services.payment_service import PaymentService

# Import Auth
from backend.app.api.auth import get_current_user
from backend.app.schemas.auth import TokenData
from backend.app.models.account import Account
router = APIRouter()

@router.post("/create-qr", summary="Create QR")
def create_qr_code(
    payload: PaymentCreateRequest,
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
        user_id=user.resident[0].residentID,
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

@router.post("/check-expiry", summary="Quét và hủy giao dịch quá hạn")
def check_expired_transactions(
    db: Session = Depends(get_db),
):
    try:
        result = PaymentService.cancel_expired_transactions(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
