import os
import re
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException

# IMPORT MODELS
from app.models.bill import Bill
from app.models.payment_transaction import PaymentTransaction 
from app.models.transaction_detail import TransactionDetail

# CONFIG
BANK_ID = os.getenv("BANK_ID", "MB") 
BANK_ACCOUNT = os.getenv("BANK_ACCOUNT", "")
TEMPLATE = os.getenv("BANK_TEMPLATE", "compact2")

class PaymentService:
    
    # TẠO GIAO DỊCH & SINH QR
    @staticmethod
    def create_qr_transaction(db: Session, user_id: int, bill_ids: list[int]):
        """
        Input: Danh sách Bill ID
        Output: Thông tin giao dịch + Link QR Code
        """

        # Lấy thông tin các hóa đơn từ DB
        bills = db.query(Bill).filter(Bill.billID.in_(bill_ids)).all()

        if not bills:
            raise HTTPException(status_code=404, detail="Không tìm thấy hóa đơn nào hợp lệ.")
        
        total_amount = 0

        # Tính tổng tiền & Validate
        for bill in bills:
            if bill.status == 'Paid':
                raise HTTPException(status_code=400, detail=f"Hóa đơn {bill.billID} đã được thanh toán trước đó.")
            
            total_amount += bill.amount
        
        try:
            # 3. Tạo Giao dịch
            new_trans = PaymentTransaction(
                residentID=user_id,
                amount=total_amount,
                paymentMethod="Online_Payment",
                status="Pending",
                createdDate=datetime.now()
            )
            db.add(new_trans)
            db.flush() #Sinh transID nhưng không lưu vào DB

            # 4. Sinh mã nội dung chuyển khoản
            trans_code = f"BM{new_trans.transID}"
            new_trans.paymentContent = trans_code

            # 5. Tạo chi tiết giao dịch
            for bill in bills:
                detail = TransactionDetail(
                    transID=new_trans.transID,
                    billID=bill.billID,
                    amount=bill.amount
                )
                db.add(detail)
            
            # COMMIT
            db.commit()
            db.refresh(new_trans)

            # Tạo Link QR VietQR
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
            print(f"[ERROR create_qr_transaction]: {str(e)}")
            raise HTTPException(status_code=500, detail="Lỗi hệ thống khi tạo giao dịch.")
        
    # XỬ LÝ WEBHOOK TỪ SEPAY
    @staticmethod
    def process_sepay_webhook(db: Session, content: str, amount_in: float, gateway_id: str, transaction_date: str):
        """
        Input: Dữ liệu từ Webhook SePay
        Output: Kết quả gạch nợ
        """
        print(f"WEBHOOK RECEIVED: {content} | Amount: {amount_in}")

        # 1. Regex tìm mã đơn hàng (BM...)
        match = re.search(r"BM(\d+)", content, re.IGNORECASE)
        
        if not match:
            # Trả về Success=False để SePay biết (hoặc True nếu muốn SePay ngừng spam)
            return {"success": False, "message": "Không tìm thấy mã đơn hàng (BM...) trong nội dung"}
        
        trans_id = int(match.group(1))

        # 2. Tìm Transaction trong DB
        transaction = db.query(PaymentTransaction).filter(PaymentTransaction.transID == trans_id).first()

        if not transaction:
            return {"success": False, "message": f"Không tìm thấy Transaction ID {trans_id}"}

        # 3. Kiểm tra Idempotency
        if transaction.status == 'Success':
            return {"success": True, "message": "Giao dịch này đã được gạch nợ trước đó"}

        # 4. Kiểm tra số tiền
        if float(amount_in) < float(transaction.amount):
             return {
                 "success": False, 
                 "message": f"Thiếu tiền. Cần: {transaction.amount}, Nhận: {amount_in}"
             }

        try:
            # 5. Update Bill (Update DB)
            
            # 5a. Update Transaction
            transaction.status = 'Success'
            transaction.payDate = datetime.now()
            transaction.gatewayTransCode = str(gateway_id)
            
            # 5b. Update các Bill con thành 'Paid'
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