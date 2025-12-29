import datetime as dt
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.app.models.service_fee import ServiceFee
from backend.app.models.apartment import Apartment
from backend.app.models.bill import Bill
from backend.app.models.resident import Resident
from backend.app.models.transaction_detail import TransactionDetail

class AccountingService:
    @staticmethod
    def create_or_update_fee(db: Session, fee_data, building_id="B01"):
        existing_fee = db.query(ServiceFee).filter(
            ServiceFee.serviceName == fee_data.serviceName,
            ServiceFee.buildingID == building_id
        ).first()

        if existing_fee:
            existing_fee.unitPrice = fee_data.unitPrice
            msg = f"Cập nhật đơn giá {fee_data.serviceName} thành công."
        else:
            new_fee = ServiceFee(
                serviceName=fee_data.serviceName,
                unitPrice=fee_data.unitPrice,
                buildingID=building_id
            )
            db.add(new_fee)
            msg = f"Tạo mới phí {fee_data.serviceName} thành công."
        
        db.commit()
        return msg

    @staticmethod
    def calculate_monthly_bills(db: Session, month: int, year: int, accountant_id: int, readings: dict = None):
        """
        readings: Dict chứa chỉ số điện nước theo apartmentID. 
        VD: {"A101": {"dien_moi": 150, "dien_cu": 100, "nuoc_moi": 20, "nuoc_cu": 10}}
        """
        deadline_date = dt.date(year, month, 10)
        
        # Xóa bill cũ nếu đã tồn tại (logic ghi đè)
        old_bills = db.query(Bill).filter(Bill.deadline == deadline_date).all()
        if old_bills:
            old_ids = [b.billID for b in old_bills]
            db.query(TransactionDetail).filter(TransactionDetail.billID.in_(old_ids)).delete(synchronize_session=False)
            db.query(Bill).filter(Bill.billID.in_(old_ids)).delete(synchronize_session=False)

        apartments = db.query(Apartment).all()
        fees = db.query(ServiceFee).all()
        bill_count = 0

        for apt in apartments:
            area = getattr(apt, 'area', 70) # Mặc định 70 nếu model chưa có field area
            
            for fee in fees:
                unit_price = Decimal(str(fee.unitPrice))
                fee_name_lower = fee.serviceName.lower()
                amount = Decimal('0')

                # Logic tính phí
                if "điện" in fee_name_lower or "nước" in fee_name_lower:
                    # Lấy chỉ số từ dữ liệu gửi lên (thay cho input() cũ)
                    apt_reading = (readings or {}).get(apt.apartmentID, {})
                    prefix = "dien" if "điện" in fee_name_lower else "nuoc"
                    new_idx = apt_reading.get(f"{prefix}_moi", 0)
                    old_idx = apt_reading.get(f"{prefix}_cu", 0)
                    consumption = max(0, new_idx - old_idx)
                    amount = unit_price * Decimal(str(consumption))
                elif any(x in fee_name_lower for x in ["quản lý", "vệ sinh"]):
                    amount = unit_price * Decimal(str(area))
                else:
                    amount = unit_price

                new_bill = Bill(
                    apartmentID=apt.apartmentID,
                    accountantID=accountant_id,
                    createDate=dt.datetime.now(),
                    deadline=deadline_date,
                    typeOfBill=fee.serviceName,
                    amount=amount,
                    total=amount,
                    status='Unpaid'
                )
                db.add(new_bill)
                bill_count += 1
        
        db.commit()
        return bill_count