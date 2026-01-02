from sqlalchemy.orm import Session
from backend.app.models.notification import Notification
from backend.app.models.resident import Resident
from backend.app.models.bill import Bill
from datetime import datetime

class NotificationService:

    @staticmethod
    def notify_new_bill(db: Session, bill_id: int):
        """
        Tạo thông báo hóa đơn.
        - Định kỳ
        - Hóa đơn lẻ
        """
        bill = db.query(Bill).filter(Bill.billID == bill_id).first()
        if not bill:
            return

        resident = db.query(Resident).filter(Resident.apartmentID == bill.apartmentID).first()
        if not resident:
            return

        monthly_types = ["ELECTRICITY", "WATER", "SERVICE"]

        if bill.typeOfBill in monthly_types:
            bill_type_map = {
                "ELECTRICITY": "Tiền Điện",
                "WATER": "Tiền Nước",
                "SERVICE": "Phí Dịch Vụ",
            }
            type_vn = bill_type_map.get(bill.typeOfBill, bill.typeOfBill)
            
            month_str = str(bill.createDate.month) if bill.createDate else str(datetime.now().month)
            year_str = str(bill.createDate.year) if bill.createDate else str(datetime.now().year)

            title = f"Thông báo đóng {type_vn}"
            content = (
                f"Hóa đơn {type_vn} tháng {month_str}/{year_str}.\n"
                f"Tổng tiền: {bill.total:,.0f}đ.\n"
                f"Hạn thanh toán: {bill.deadline}."
            )
        else:

            title = f"Thông báo {bill.typeOfBill}"

            content = (
                f"{bill.typeOfBill}. Tổng tiền: {bill.total:,.0f}đ. Hạn thanh toán: {bill.deadline}."
            )

        noti = Notification(
            residentID=resident.residentID,
            type="NEW_BILL",
            title=title,
            content=content,
            relatedID=bill.billID,
            isRead=False,
            createdDate=datetime.now()
        )
        db.add(noti)
        db.commit()

    @staticmethod
    def notify_payment_result(db: Session, content: str, resident_id: int, status: str, amount: float, trans_id: int):
        """
        Tạo thông báo kết quả giao dịch (Thành công / Thất bại).
        """
        if status == "Success":
            title = "Thanh toán thành công"
            content = f"Giao dịch {content} của bạn thanh toán thành công."
        elif status == "Failed":
            title = "Thanh toán thất bại"
            content = f"Giao dịch {content} thanh toán không thành công. Vui lòng kiểm tra lại số dư hoặc thử lại."
        else:
            title = "Lỗi giao dịch"
            content = f"Có lỗi xảy ra trong quá trình xử lý giao dịch {content}."

        noti = Notification(
            residentID=resident_id,
            type="PAYMENT_RESULT",
            title=title,
            content=content,
            relatedID=trans_id,
            isRead=False
        )
        db.add(noti)
        db.commit()

    @staticmethod
    def create_broadcast(db: Session, title: str, content: str):
        residents = db.query(Resident).all()
        noti_list = []
        
        for r in residents:
            noti_list.append(Notification(
                residentID=r.residentID,
                type="GENERAL", 
                title=title,
                content=content,
                isRead=False,
                createdDate=datetime.now()
            ))
            
        if noti_list:
            db.add_all(noti_list)
            db.commit()
            
        return len(residents)