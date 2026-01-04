from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.db import get_db
from backend.app.schemas.payment import OfflinePaymentRespone, PaymentCreateRequest
from backend.app.services.offline_payment_service import OfflinePaymentService

# Import Auth
from backend.app.models.resident import Resident

router = APIRouter()

@router.post("/create-transaction", summary="Create QR and transaction")
def create_qr_code(
    apartment_id: str,
    payload: PaymentCreateRequest,
    db: Session = Depends(get_db),
):
    
    resident = db.query(Resident).filter(Resident.apartmentID == apartment_id).first()
    
    return OfflinePaymentService.create_qr_transaction(
        db=db,
        user_id=getattr(resident, 'residentID'),
        bill_ids=payload.bill_ids
    )

@router.post("/verify-transaction", summary="Accountant verify offline payment")
def receive_webhook(
    payload: OfflinePaymentRespone,
    db: Session = Depends(get_db)
):
    return OfflinePaymentService.process_webhook(
        db=db,
        content=payload.content,
        amount_in=float(payload.transferAmount),
    )
