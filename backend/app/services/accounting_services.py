import datetime as dt
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.service_fee import ServiceFee
from backend.app.models.apartment import Apartment
from backend.app.models.bill import Bill
from backend.app.models.transaction_detail import TransactionDetail
from backend.app.schemas.bill import BillCreate
from backend.app.services.notification_service import NotificationService
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
        """
        1. Hóa đơn Điện
        2. Hóa đơn Nước
        3. Hóa đơn Dịch vụ chung
        """
        deadline_date = dt.date(year, month, deadline_day)
        
        existing_bills = db.query(Bill).filter(
            Bill.deadline == deadline_date,
            (
                Bill.typeOfBill.like(f"Tiền Điện T{month}%") | 
                Bill.typeOfBill.like(f"Tiền Nước T{month}%") |
                Bill.typeOfBill.like(f"Phí Dịch vụ T{month}%")
            )
        ).all()
        
        if existing_bills:
            if not overwrite:
                raise Exception(f"Đã có hóa đơn tháng {month}/{year}. Chọn 'Ghi đè' để tính lại.")
            for b in existing_bills: db.delete(b)
            db.commit()

        apartments = db.query(Apartment).all()
        fees = db.query(ServiceFee).all()
        new_bills_to_add = []
        notification_queue = [] 

        for apt in apartments:
            elec_total = Decimal('0')
            water_total = Decimal('0')
            service_total = Decimal('0')
            
            elec_details = {"electricity_usage": 0, "electricity_cost": 0}
            water_details = {"water_usage": 0, "water_cost": 0}

            for fee in fees:
                if fee.buildingID != apt.buildingID: continue
                
                unit_price = Decimal(str(fee.unitPrice))
                fee_name_lower = fee.serviceName.lower()
                
                if "điện" in fee_name_lower:
                    apt_reading = (readings or {}).get(apt.apartmentID, {})
                    consumption = max(0, apt_reading.get("dien_moi", 0) - apt_reading.get("dien_cu", 0))
                    amount = unit_price * Decimal(str(consumption))
                    
                    if amount > 0:
                        elec_total += amount
                        elec_details["electricity_usage"] = consumption
                        elec_details["electricity_cost"] = amount

                elif "nước" in fee_name_lower:
                    apt_reading = (readings or {}).get(apt.apartmentID, {})
                    consumption = max(0, apt_reading.get("nuoc_moi", 0) - apt_reading.get("nuoc_cu", 0))
                    amount = unit_price * Decimal(str(consumption))
                    
                    if amount > 0:
                        water_total += amount
                        water_details["water_usage"] = consumption
                        water_details["water_cost"] = amount

                else:
                    service_total += unit_price

            if elec_total > 0:
                bill_elec = Bill(
                    apartmentID=apt.apartmentID,
                    accountantID=accountant_id,
                    createDate=dt.datetime.now(),
                    deadline=deadline_date,
                    typeOfBill=f"Tiền Điện T{month}/{year}",
                    amount=elec_total,
                    total=elec_total,
                    status='Unpaid'
                )
                new_bills_to_add.append(bill_elec)
                notification_queue.append({
                    "bill": bill_elec, 
                    "details": elec_details
                })

            if water_total > 0:
                bill_water = Bill(
                    apartmentID=apt.apartmentID,
                    accountantID=accountant_id,
                    createDate=dt.datetime.now(),
                    deadline=deadline_date,
                    typeOfBill=f"Tiền Nước T{month}/{year}",
                    amount=water_total,
                    total=water_total,
                    status='Unpaid'
                )
                new_bills_to_add.append(bill_water)
                notification_queue.append({
                    "bill": bill_water, 
                    "details": water_details
                })

            if service_total > 0:
                bill_service = Bill(
                    apartmentID=apt.apartmentID,
                    accountantID=accountant_id,
                    createDate=dt.datetime.now(),
                    deadline=deadline_date,
                    typeOfBill=f"Phí Dịch vụ T{month}/{year}",
                    amount=service_total,
                    total=service_total,
                    status='Unpaid'
                )
                new_bills_to_add.append(bill_service)
                notification_queue.append({
                    "bill": bill_service, 
                    "details": {} 
                })

        if new_bills_to_add:
            db.add_all(new_bills_to_add)
            db.commit() 
            
            for item in notification_queue:
                NotificationService.notify_new_bill(
                    db, 
                    item["bill"].billID, 
                )

        return len(new_bills_to_add)

    @staticmethod
    def create_manual_bill(db: Session, data: BillCreate, accountant_id: int):
        """
        Dùng cho: Sửa chữa, Phạt, Dịch vụ riêng lẻ...
        Logic: Tạo bill -> Lưu DB -> Thông báo riêng cho căn hộ đó.
        """
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

        NotificationService.notify_new_bill(
            db=db, 
            bill_id=new_bill.billID, 
        )
        
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