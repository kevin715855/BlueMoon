from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.db import get_db
from backend.app.models.bill import Bill
from backend.app.models.payment_transaction import PaymentTransaction
from backend.app.models.resident import Resident
from backend.app.models.transaction_detail import TransactionDetail
from backend.app.schemas.payment import ReceiptResponse, ReceiptBillDetail

# Import Auth
from backend.app.api.auth import get_current_user

router = APIRouter()


@router.get("/{transaction_id}", response_model=ReceiptResponse, summary="Xuất biên lai thanh toán")
def get_receipt(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_accountant = Depends(get_current_user)
):
    """
    Lấy thông tin biên lai thanh toán theo transaction ID.
    Áp dụng cho cả thanh toán online và offline.
    """
    
    # Lấy transaction
    transaction = db.query(PaymentTransaction).filter(
        PaymentTransaction.transID == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(404, "Không tìm thấy giao dịch")
    
    # Lấy thông tin resident
    resident = db.query(Resident).filter(
        Resident.residentID == getattr(transaction, 'residentID')
    ).first()
    
    if not resident:
        raise HTTPException(404, "Không tìm thấy thông tin cư dân")
    
    # Lấy chi tiết các hóa đơn đã thanh toán trong transaction này
    transaction_details = db.query(TransactionDetail).filter(
        TransactionDetail.transID == transaction_id
    ).all()
    
    bills_data = []
    if transaction_details:
        bill_ids = [getattr(td, 'billID') for td in transaction_details]
        bills = db.query(Bill).filter(Bill.billID.in_(bill_ids)).all()
        
        for bill in bills:
            bills_data.append(ReceiptBillDetail(
                billID=getattr(bill, 'billID'),
                billName=str(getattr(bill, 'billName', '')),
                amount=float(getattr(bill, 'amount', 0)),
                dueDate=str(getattr(bill, 'dueDate', ''))
            ))
    
    return ReceiptResponse(
        transID=getattr(transaction, 'transID'),
        residentID=getattr(transaction, 'residentID'),
        residentName=str(getattr(resident, 'fullName', '')),
        apartmentID=str(getattr(resident, 'apartmentID', '')),
        phoneNumber=str(getattr(resident, 'phoneNumber', None)) if getattr(resident, 'phoneNumber', None) else None,
        totalAmount=float(getattr(transaction, 'amount', 0)),
        paymentMethod=str(getattr(transaction, 'paymentMethod', '')),
        paymentContent=str(getattr(transaction, 'paymentContent', None)) if getattr(transaction, 'paymentContent', None) else None,
        status=str(getattr(transaction, 'status', '')),
        payDate=str(getattr(transaction, 'payDate', '')),
        bills=bills_data
    )
