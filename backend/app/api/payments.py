from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.db import get_db
from backend.app.schemas.payment import PaymentTransactionRead
from backend.app.models.payment_transaction import PaymentTransaction
from backend.app.models.resident import Resident

from backend.app.api.auth import get_current_user

router = APIRouter()

@router.get("/my-history", response_model=List[PaymentTransactionRead])
def get_my_transaction_history(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    resident = db.query(Resident).filter(current_user.username==Resident.username).first()
    if not resident:
        return []
    
    my_history = db.query(PaymentTransaction).filter(resident.residentID==PaymentTransaction.residentID).all()

    return my_history