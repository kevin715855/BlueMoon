from sqlalchemy.orm import Session
from backend.app.models.notification import Notification
from backend.app.models.resident import Resident
from backend.app.models.bill import Bill
from backend.app.models.meter_reading import MeterReading
from datetime import datetime

class NotificationService:

    @staticmethod
    def notify_new_bill(db: Session, bill_id: int, month: int, year: int, reading: MeterReading = None):
        """Soạn nội dung thông báo dựa trên loại hóa đơn"""
        bill = db.query(Bill).filter(Bill.billID == bill_id).first()
        if not bill: return

        resident = db.query(Resident).filter(Resident.apartmentID == bill.apartmentID).first()
        if not resident: return

        title = ""
        content = ""
        elec_val = None
        water_val = None

        if bill.typeOfBill == "ELECTRICITY":
            title = f"Tiền Điện Tháng {month}/{year}"
            cons = reading.newElectricity - reading.oldElectricity
            content = (
                f"Thông báo tiền điện căn hộ {bill.apartmentID}:\n"
                f"- Chỉ số: {reading.oldElectricity:g} -> {reading.newElectricity:g}\n"
                f"- Tiêu thụ: {cons:g} kWh\n"
                f"- Tổng tiền: {bill.total:,.0f} VNĐ\n"
                f"- Hạn thanh toán: {bill.deadline.strftime('%d/%m/%Y')}"
            )
            elec_val = reading.newElectricity

        elif bill.typeOfBill == "WATER":
            title = f"Tiền Nước Tháng {month}/{year}"
            cons = reading.newWater - reading.oldWater
            content = (
                f"Thông báo tiền nước căn hộ {bill.apartmentID}:\n"
                f"- Chỉ số: {reading.oldWater:g} -> {reading.newWater:g}\n"
                f"- Tiêu thụ: {cons:g} m3\n"
                f"- Tổng tiền: {bill.total:,.0f} VNĐ\n"
                f"- Hạn thanh toán: {bill.deadline.strftime('%d/%m/%Y')}"
            )
            water_val = reading.newWater

        elif bill.typeOfBill == "SERVICE":
            title = f"Phí Dịch Vụ Tháng {month}/{year}"
            content = (
                f"Thông báo các phí dịch vụ căn hộ {bill.apartmentID} (Quản lý, Gửi xe, Rác...):\n"
                f"- Tổng cộng: {bill.total:,.0f} VNĐ"
                f"- Hạn thanh toán: {bill.deadline.strftime('%d/%m/%Y')}\n"
                f"Vui lòng thanh toán đúng hạn để tránh phát sinh phí."
            )

        noti = Notification(
            residentID=resident.residentID,
            title=title,
            content=content,
            type="NEW_BILL",
            relatedID=bill.billID,
            isRead=False,
            createdDate=datetime.now(),
            electricity=elec_val,
            water=water_val
        )
        db.add(noti)

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
            isRead=False,
            createdDate=datetime.now()
        )
        db.add(noti)
        db.commit()

    @staticmethod
    def create_broadcast(db: Session, title: str, content: str):
        """Gửi thông báo chung cho tất cả cư dân"""
        residents = db.query(Resident).all()
        for r in residents:
            db.add(Notification(
                residentID=r.residentID, title=title, content=content,
                type="GENERAL", isRead=False, createdDate=datetime.now()
            ))
        db.commit()
        return len(residents)