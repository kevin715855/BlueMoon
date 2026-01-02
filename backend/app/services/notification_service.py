from sqlalchemy.orm import Session
from backend.app.models.notification import Notification
from backend.app.schemas.notification import MeterReadingInput
from backend.app.models.resident import Resident
from backend.app.models.bill import Bill

class NotificationService:
    
    @staticmethod
    def notify_payment_result(db: Session, resident_id: int, status: str, amount: float, trans_id: int):
        """Tạo thông báo kết quả giao dịch"""
        title = "Thanh toán thành công" if status == "Success" else "Thanh toán thất bại"
        content = f"Giao dịch {amount:,.0f}đ của bạn đã {'được ghi nhận' if status == 'Success' else 'bị hủy/lỗi'}."
        
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
    def notify_new_bill(db: Session, bill_id: int):
        """Tạo thông báo hóa đơn mới"""
        bill = db.query(Bill).filter(Bill.billID == bill_id).first()
        if not bill:
            return

        resident = db.query(Resident).filter(Resident.apartmentID == bill.apartmentID).first()
        if not resident:
            return

        noti = Notification(
            residentID=resident.residentID,
            type="NEW_BILL",
            title=f"Hóa đơn mới: {bill.typeOfBill}",
            content=f"Bạn có hóa đơn tổng {bill.total:,.0f}đ. Hạn đóng: {bill.deadline}.",
            relatedID=bill.billID,
            isRead=False
        )
        db.add(noti)
        db.commit()

    @staticmethod
    def create_broadcast(db: Session, title: str, content: str):
        """Gửi thông báo chung cho toàn bộ cư dân"""
        residents = db.query(Resident).all()
        noti_list = []
        for r in residents:
            noti_list.append(Notification(
                residentID=r.residentID,
                type="GENERAL",
                title=title,
                content=content,
                isRead=False
            ))
        db.add_all(noti_list)
        db.commit()
        return len(residents)

    @staticmethod
    def send_meter_notifications(db: Session, month: int, year: int, readings_data: list[MeterReadingInput]):
        """
        Nhận danh sách chỉ số từ Admin và tạo thông báo lưu vào DB.
        """
        noti_list = []
        
        for item in readings_data:
            noti_list.append(Notification(
                residentID=item.residentID,
                type="METER_READING",
                title=f"Thông báo chỉ số Điện/Nước tháng {month}/{year}",
                content=f"Chỉ số tháng {month}: Điện {item.electricity} (kWh), Nước {item.water} (m3).",
                
                # Lưu thẳng vào 2 cột có sẵn trong bảng Notification
                electricity=item.electricity,
                water=item.water,
                
                isRead=False
            ))

        if noti_list:
            db.add_all(noti_list)
            db.commit()
            
        return len(noti_list)