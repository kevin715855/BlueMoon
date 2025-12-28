import os
import re
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.bill import Bill
from app.models.transaction import PaymentTransaction, TransactionDetail

# Config
BANK_ID = os.getenv("BANK_ID", "MB") 
BANK_ACCOUNT = os.getenv("BANK_ACCOUNT", "")
TEMPLATE = os.getenv("BANK_TEMPLATE", "compact2")

class PaymentService:
    # Create transaction and auto create QR

    @staticmethod
    def create_qr_transaction(db: Session, user_id: int, bill_ids: list[int]):
        """
        Input: List of BillId
        Output: QR transaction
        """

        # Get Bill information from DB 
        # Nho tao ham lay thong tin trong thu muc database (class SQLDatabase)
        bills = db.query(Bill).filter(Bill.billID.in_(bill_ids)).all()

        if not bills:
            raise HTTPException(status_code=404, detail="Không tìm thấy hóa đơn nào")
        
        total_amount = 0

        for bill in bills:
            if bill.status == 'Paid':
                raise HTTPException(status_code=400, detail=f"Hóa đơn {bill.billID} đã thanh toán.")

            total_amount += bill.amount
        
        try:
            new_trans = PaymentTransaction(
                residentID=user_id,
                amount = total_amount,
                paymentMethod="OnlinePayment",
                status="Pending",
                createDate=datetime.now()
            )
            db.add(new_trans)
            db.commit()
            db.refresh(new_trans)

            trans_code = f"BM{new_trans.transID}"
            new_trans.paymentContent = trans_code

            for bill in bills:
                detail = TransactionDetail(
                    transID=new_trans.transID,
                    billID=bill.billID,
                    amount=bill.amount
                )
                db.add(detail)
            
            db.commit()

            qr_url = (
                f"https://img.vietqr.io/image/{BANK_ID}-{BANK_ACCOUNT}-{TEMPLATE}.png"
                f"?amount={int(total_amount)}"
                f"&addInfo={trans_code}"
            )

            return {
                "transaction_id": new_trans.transID,
                "trans_code": trans_code,
                "total_amount": total_amount,
                "qr_url": qr_url
            }

        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Lỗi tạo giao dịch: {str(e)}")
        
    @staticmethod
    def process_sepay_webhook(db: Session, content: str, amount_in: float, gateway_id: str, transaction_date: str):
        """
        Input: Data from Sepay
        Output: Update data in database
        """
        print(f"WEBHOOK RECEIVED: {content} | Amount: {amount_in}")

        match = re.search(r"BM(\d+)", content, re.IGNORECASE)
        
        if not match:
            return {"success": False, "message": "Không tìm thấy mã đơn hàng (BM...) trong nội dung"}
        
        trans_id = int(match.group(1))

        # 2. Tìm Transaction trong DB
        transaction = db.query(PaymentTransaction).filter(PaymentTransaction.transID == trans_id).first()

        if not transaction:
            return {"success": False, "message": f"Không tìm thấy Transaction ID {trans_id} trong hệ thống"}

        # 3. Kiểm tra Idempotency (Chống xử lý trùng lặp)
        if transaction.status == 'Success':
            return {"success": True, "message": "Giao dịch này đã được gạch nợ trước đó rồi"}

        # 4. Kiểm tra số tiền (Phải chuyển ĐỦ hoặc DƯ)
        # Lưu ý: float đôi khi không chính xác tuyệt đối, nên cẩn thận khi so sánh bằng (==)
        if float(amount_in) < float(transaction.amount):
             return {
                 "success": False, 
                 "message": f"Chuyển thiếu tiền. Cần: {transaction.amount}, Nhận: {amount_in}"
             }

        try:
            # 5a. Update trạng thái Transaction
            transaction.status = 'Success'
            transaction.payDate = datetime.now()
            transaction.gatewayTransCode = str(gateway_id) # Lưu ID của SePay để đối soát
            
            # 5b. Update trạng thái các Bill con thành 'Paid'
            details = db.query(TransactionDetail).filter(TransactionDetail.transID == transaction.transID).all()
            for detail in details:
                bill = db.query(Bill).filter(Bill.billID == detail.billID).first()
                if bill:
                    bill.status = 'Paid'
            
            db.commit()
            print(f"--> GẠCH NỢ THÀNH CÔNG: TransID {trans_id}")
            return {"success": True, "message": "Gạch nợ thành công"}

        except Exception as e:
            db.rollback()
            print(f"--> LỖI GẠCH NỢ: {e}")
            return {"success": False, "message": f"Lỗi Database: {str(e)}"}