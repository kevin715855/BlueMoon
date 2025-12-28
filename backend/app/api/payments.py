from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from backend.app.schemas.payment_schema import PaymentCreateRequest, SePayTransactionSchema, SePayWebhookPayload
from app.services.payment_service import PaymentService

router = APIRouter()

@router.post("/create-qr")
def create_qr_code(
    payload: PaymentCreateRequest,
    db: Session = Depends(get_db)
):
    pass