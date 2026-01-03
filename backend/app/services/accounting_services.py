import datetime as dt
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.service_fee import ServiceFee
from backend.app.models.apartment import Apartment
from backend.app.models.bill import Bill
from backend.app.schemas.bill import BillCreate
from backend.app.models.meter_reading import MeterReading

from backend.app.models.transaction_detail import TransactionDetail
from backend.app.services.notification_service import NotificationService

class AccountingService:
    
    @staticmethod
    def calculate_electricity_cost(consumption: float) -> Decimal:
        """Tính tiền điện sinh hoạt 6 bậc + 8% VAT"""
        if consumption <= 0: return Decimal('0')
        TIERS = [
            (50, 1984), (50, 2050), (100, 2380), 
            (100, 2998), (100, 3350), (float('inf'), 3460)
        ]
        base_amount = Decimal('0')
        remaining = consumption
        for limit, price in TIERS:
            if remaining <= 0: break
            usage_in_tier = min(remaining, limit)
            base_amount += Decimal(str(usage_in_tier)) * Decimal(str(price))
            remaining -= usage_in_tier
        return (base_amount * Decimal('1.08')).quantize(Decimal('1'), rounding=ROUND_HALF_UP)

    @staticmethod
    def calculate_water_cost(consumption: float) -> Decimal:
        """Tính tiền nước sạch 4 bậc + 10% BVMT + 5% VAT (Tổng 15.5% thuế phí)"""
        if consumption <= 0: return Decimal('0')
        TIERS = [(10, 8500), (10, 9900), (10, 16000), (float('inf'), 27000)]
        base_amount = Decimal('0')
        remaining = consumption
        for limit, price in TIERS:
            if remaining <= 0: break
            usage_in_tier = min(remaining, limit)
            base_amount += Decimal(str(usage_in_tier)) * Decimal(str(price))
            remaining -= usage_in_tier
        
        # Tiền nước = Giá gốc + 10% phí BVMT + 5% VAT trên giá gốc
        total = base_amount + (base_amount * Decimal('0.10')) + (base_amount * Decimal('0.05'))
        return total.quantize(Decimal('1'), rounding=ROUND_HALF_UP)

    @staticmethod
    def calculate_monthly_bills(db: Session, month: int, year: int, accountant_id: int, deadline_day: int, overwrite: bool = False):
        """Tính toán và tạo hóa đơn cho 3 luồng: Điện, Nước, Phí dịch vụ"""
        deadline_date = dt.date(year, month, deadline_day)

        existing_bills = db.query(Bill).filter(
            Bill.deadline == deadline_date,
            Bill.typeOfBill.in_(["ELECTRICITY", "WATER", "SERVICE"])
        )

        if existing_bills.count() > 0:
            if not overwrite:
                raise Exception(f"Đã có hóa đơn tháng {month}/{year}. Chọn 'Ghi đè' để tính lại.")
            
            bills_to_delete = existing_bills.all()
            bill_ids = [b.billID for b in bills_to_delete]
            
            if bill_ids:
                db.query(TransactionDetail).filter(
                    TransactionDetail.billID.in_(bill_ids)
                ).delete(synchronize_session=False)

            existing_bills.delete(synchronize_session=False)
            db.commit()

        apartments = db.query(Apartment).all()
        all_fees = db.query(ServiceFee).all()
        bills_created = 0

        readings = db.query(MeterReading).filter(
            MeterReading.month == month,
            MeterReading.year == year
        ).all()

        reading_map = {r.apartmentID: r for r in readings}

        for apt in apartments:
            reading = reading_map.get(apt.apartmentID)

            if reading and reading.newElectricity > reading.oldElectricity:
                elec_cons = reading.newElectricity - reading.oldElectricity

                if elec_cons > 0:
                    elec_total = AccountingService.calculate_electricity_cost(float(elec_cons))
                    
                    bill_elec = Bill(
                        apartmentID=apt.apartmentID, 
                        accountantID=accountant_id,
                        createDate=dt.datetime.now(),
                        deadline=deadline_date,
                        typeOfBill="ELECTRICITY",
                        amount=elec_total,
                        total=elec_total,
                        status='Unpaid'
                    )
                    db.add(bill_elec)
                    db.flush() 
                    NotificationService.notify_new_bill(db, bill_elec.billID, month, year, reading)
                    bills_created += 1

            if reading and reading.newWater > reading.oldWater:
                water_cons = reading.newWater - reading.oldWater
                if water_cons > 0:
                    water_total = AccountingService.calculate_water_cost(float(water_cons))
                    
                    bill_water = Bill(
                        apartmentID=apt.apartmentID,
                        accountantID=accountant_id,
                        createDate=dt.datetime.now(),
                        deadline=deadline_date,
                        typeOfBill="WATER",
                        amount=water_total,
                        total=water_total,
                        status='Unpaid'
                    )
                    db.add(bill_water)
                    db.flush()
                    NotificationService.notify_new_bill(db, bill_water.billID, month, year, reading)
                    bills_created += 1

            apt_fees = [f for f in all_fees if f.buildingID == apt.buildingID]
            service_sum = sum(Decimal(str(f.unitPrice)) for f in apt_fees 
                             if "điện" not in f.serviceName.lower() and "nước" not in f.serviceName.lower())
            
            if service_sum > 0:
                bill_service = Bill(
                    apartmentID=apt.apartmentID,
                    accountantID=accountant_id,
                    createDate=dt.datetime.now(),
                    deadline=deadline_date,
                    typeOfBill="SERVICE",
                    amount=service_sum,
                    total=service_sum,
                    status='Unpaid'
                )
                db.add(bill_service)
                db.flush()
                NotificationService.notify_new_bill(db, bill_service.billID, month, year)
                bills_created += 1

        db.commit()

        return bills_created

    @staticmethod
    def create_or_update_fee(db: Session, fee_data, building_id):
        """Thiết lập đơn giá phí dịch vụ"""
        existing_fee = db.query(ServiceFee).filter(
            ServiceFee.serviceName == fee_data.serviceName,
            ServiceFee.buildingID == building_id
        ).first()

        if existing_fee:
            existing_fee.unitPrice = fee_data.unitPrice
            msg = f"Cập nhật {fee_data.serviceName} thành công."
        else:
            new_fee = ServiceFee(serviceName=fee_data.serviceName, unitPrice=fee_data.unitPrice, buildingID=building_id)
            db.add(new_fee)
            msg = f"Tạo mới {fee_data.serviceName} thành công."
        db.commit()
        return msg
    
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
        query = db.query(Bill)
        if apartment_id: query = query.filter(Bill.apartmentID == apartment_id)
        if status: query = query.filter(Bill.status == status)
        return query.order_by(Bill.createDate.desc()).all()

    @staticmethod
    def get_unpaid_summary(db: Session):
        results = db.query(
            Bill.apartmentID, func.sum(Bill.total).label("total_unpaid"), func.count(Bill.billID).label("bill_count")
        ).filter(Bill.status == "Unpaid").group_by(Bill.apartmentID).all()
        return [{"apartmentID": r.apartmentID, "total_unpaid": float(r.total_unpaid), "bill_count": r.bill_count} for r in results]