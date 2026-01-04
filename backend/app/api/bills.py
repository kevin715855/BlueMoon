from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.db import get_db
from backend.app.schemas.bill import BillRead
from backend.app.models.bill import Bill
from backend.app.models.resident import Resident 

from backend.app.api.auth import get_current_user

router = APIRouter()

@router.get("/my-bills", response_model=List[BillRead])
def get_bills_data(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    resident = db.query(Resident).filter(current_user.username==Resident.username).first()
    if not resident:
        return []

    my_bills = db.query(Bill).filter(Bill.apartmentID==resident.apartmentID).all()
    return my_bills

@router.get("/bills-unpaid", response_model=List[BillRead])
def get_unpaid_bills(
    db: Session = Depends(get_db),
):
    my_bills = db.query(Bill).filter(Bill.status == "Unpaid").all()
    return my_bills