import datetime as dt
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.service_fee import ServiceFee
from backend.app.models.apartment import Apartment
from backend.app.models.bill import Bill
from backend.app.models.transaction_detail import TransactionDetail
from backend.app.schemas.bill import BillCreate
from calendar import monthrange

class AccountingService:
    
    @staticmethod
    def check_existing_bills(db: Session, month: int, year: int, deadline_day: int):
        """Kiểm tra xem đã có hóa đơn nào có hạn vào ngày này chưa"""
        deadline_date = dt.date(year, month, deadline_day)
        return db.query(Bill).filter(Bill.deadline == deadline_date).count()

    @staticmethod
    def create_or_update_fee(db: Session, fee_data, building_id):
        """Tạo hoặc cập nhật đơn giá dịch vụ"""
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
    def calculate_monthly_bills(db: Session, month: int, year: int, accountant_id: int, deadline_day: int, readings: dict = None, overwrite: bool = False):
        """Logic tính phí TỔNG HỢP hàng tháng cho mỗi căn hộ"""
        last_day_of_month = monthrange(year, month)[1]
        actual_deadline_day = min(deadline_day, last_day_of_month)
        deadline_date = dt.date(year, month, actual_deadline_day)

        type_prefix = f"Phí tổng hợp {month}/{year}"

        existing_bills_query = db.query(Bill).filter(
            Bill.deadline == deadline_date,
            Bill.typeOfBill.like(f"{type_prefix}%") # Chỉ lọc hóa đơn tự động
        )
        
        
        if existing_bills_query.count() > 0:
            if not overwrite:
                raise Exception(f"Đã tồn tại hóa đơn cho kỳ {month}/{year}. Hãy chọn 'Ghi đè' để tính lại.")
            
            # Nếu cho phép ghi đè: Xóa chi tiết giao dịch trước, sau đó xóa Bill
            old_bill_ids = [b.billID for b in existing_bills_query.all()]
            db.query(TransactionDetail).filter(TransactionDetail.billID.in_(old_bill_ids)).delete(synchronize_session=False)
            existing_bills_query.delete(synchronize_session=False)

        # 3. Tính toán (Giữ nguyên logic tính của bạn nhưng tối ưu query)
        apartments = db.query(Apartment).all()
        fees = db.query(ServiceFee).all()
        new_bills = []

        for apt in apartments:
            apartment_total = Decimal('0')
            description_parts = [] 

            for fee in fees:
                # Chỉ tính phí của tòa nhà tương ứng
                if fee.buildingID != apt.buildingID:
                    continue

                unit_price = Decimal(str(fee.unitPrice))
                fee_name_lower = fee.serviceName.lower()
                fee_amount = Decimal('0')

                # A. Tính phí Điện/Nước dựa trên chỉ số
                if any(x in fee_name_lower for x in ["điện", "nước"]):
                    apt_reading = (readings or {}).get(apt.apartmentID, {})
                    prefix = "dien" if "điện" in fee_name_lower else "nuoc"
                    consumption = max(0, apt_reading.get(f"{prefix}_moi", 0) - apt_reading.get(f"{prefix}_cu", 0))
                    fee_amount = unit_price * Decimal(str(consumption))
                
                # C. Phí cố định khác
                else:
                    fee_amount = unit_price

                if fee_amount > 0:
                    apartment_total += fee_amount
                    description_parts.append(f"{fee.serviceName}")

            # 3. Tạo MỘT hóa đơn duy nhất cho toàn bộ chi phí của căn hộ
            if apartment_total > 0:
                new_bills.append(Bill(
                    apartmentID=apt.apartmentID,
                    accountantID=accountant_id,
                    createDate=dt.datetime.now(),
                    deadline=deadline_date,
                    typeOfBill=f"Phí tổng hợp {month}/{year} ",
                    amount=apartment_total,
                    total=apartment_total, 
                    status='Unpaid'
                ))
        
        if new_bills:
            db.add_all(new_bills)
            db.commit()     

        return len(new_bills)

    @staticmethod
    def create_manual_bill(db: Session, data: BillCreate, accountant_id: int):
        """Lưu hóa đơn nhập tay, tự động xử lý total"""
        
        new_bill = Bill(
            apartmentID=data.apartmentID,
            accountantID=accountant_id,
            createDate=dt.datetime.now(),
            deadline=data.deadline,
            typeOfBill=data.typeOfBill,
            amount=data.amount,
            total=data.amount,
            status='Unpaid'
        )
        db.add(new_bill)
        db.commit()
        db.refresh(new_bill)
        return new_bill

    @staticmethod
    def get_all_bills(db: Session, apartment_id=None, status=None):
        """Lấy danh sách hóa đơn theo filter"""
        query = db.query(Bill)
        if apartment_id:
            query = query.filter(Bill.apartmentID == apartment_id)
        if status:
            query = query.filter(Bill.status == status)
        return query.order_by(Bill.createDate.desc()).all()

    @staticmethod
    def get_unpaid_summary(db: Session):
        """Thống kê danh sách căn hộ nợ phí"""
        results = db.query(
            Bill.apartmentID,
            func.sum(Bill.total).label("total_unpaid"),
            func.count(Bill.billID).label("bill_count")
        ).filter(Bill.status == "Unpaid")\
         .group_by(Bill.apartmentID).all()
        
        return [
            {
                "apartmentID": r.apartmentID,
                "total_unpaid": float(r.total_unpaid),
                "bill_count": r.bill_count
            } for r in results
        ]