import datetime as dt
from decimal import Decimal
from sqlalchemy.orm import Session
from backend.app.models.service_fee import ServiceFee
from backend.app.models.apartment import Apartment
from backend.app.models.bill import Bill
from backend.app.models.resident import Resident
from backend.app.models.transaction_detail import TransactionDetail

def system_log(accountant_id, action):
    timestamp = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[SYSTEM LOG] [{timestamp}] Accountant ID {accountant_id}: {action}")

def uc_gf_notify_residents(db: Session, month: int, year: int, bill_ids: list):
    print(f"\n--- [UC_GF] ĐANG TỰ ĐỘNG GỬI THÔNG BÁO KỲ {month}/{year} ---")
    bills = db.query(Bill).filter(Bill.billID.in_(bill_ids)).all()
    
    apt_bills = {}
    for b in bills:
        if b.apartmentID not in apt_bills:
            apt_bills[b.apartmentID] = []
        apt_bills[b.apartmentID].append(b)

    for apt_id, bills_list in apt_bills.items():
        owner = db.query(Resident).filter(Resident.apartmentID == apt_id, Resident.isOwner == True).first()
        target_name = owner.fullName if owner else "Cư dân"
        
        content = f"Kính gửi {target_name} (Căn hộ {apt_id}),\n"
        content += f"Thông báo phí tháng {month}/{year}:\n"
        total_all = 0
        for b in bills_list:
            content += f" - {b.typeOfBill}: {b.amount:,.0f} VNĐ\n"
            total_all += b.amount
        content += f" >> TỔNG CỘNG: {total_all:,.0f} VNĐ\n"
        content += "Vui lòng thanh toán trước ngày 10 của tháng. Trân trọng!"
        
        print(f"[SENDING EMAIL TO {apt_id}] Content:\n{content}")
        print("-" * 30)

def execute_calculation(db: Session, month: int, year: int, deadline, accountant_id: int):
    try:
        apartments = db.query(Apartment).all()
        fees = db.query(ServiceFee).all()
        if not fees:
            return "ERROR", "Chưa có danh mục đơn giá phí nào trong hệ thống.", []

        bill_count = 0
        new_bill_ids = []
        
        for apt in apartments:
            area = getattr(apt, 'area', 0) or 0
            print(f"\n>>> Đang tính phí cho căn hộ: {apt.apartmentID}")

            for fee in fees:
                unit_price = Decimal(str(fee.unitPrice))
                fee_name_lower = fee.serviceName.lower()
                amount = Decimal('0')

                # LOGIC 1: Phí tính theo chỉ số (Điện, Nước)
                if any(x in fee_name_lower for x in ["điện", "nước"]):
                    print(f" Nhập chỉ số cho [{fee.serviceName}]:")
                    old_idx = float(input(f"  - Chỉ số cũ: "))
                    new_idx = float(input(f"  - Chỉ số mới: "))
                    consumption = max(0, new_idx - old_idx)
                    amount = unit_price * Decimal(str(consumption))
                    print(f"  => Tiêu thụ: {consumption} | Thành tiền: {amount:,.0f}")

                # LOGIC 2: Phí tính theo diện tích (Quản lý, Vệ sinh)
                elif any(x in fee_name_lower for x in ["quản lý", "vệ sinh"]):
                    amount = unit_price * Decimal(str(area))
                
                # LOGIC 3: Phí cố định (Internet, Khác)
                else:
                    amount = unit_price

                new_bill = Bill(
                    apartmentID=apt.apartmentID,
                    accountantID=accountant_id,
                    createDate=dt.datetime.now(),
                    deadline=deadline,
                    typeOfBill=fee.serviceName,
                    amount=amount,
                    total=amount,
                    status='Unpaid'
                )
                db.add(new_bill)
                db.flush()
                new_bill_ids.append(new_bill.billID)
                bill_count += 1

        db.commit()
        system_log(accountant_id, f"Tính phí thành công. Số hóa đơn: {bill_count}")
        
        if new_bill_ids:
            uc_gf_notify_residents(db, month, year, new_bill_ids)
            
        return "SUCCESS", bill_count, []
    except Exception as e:
        db.rollback()
        return "ERROR", str(e), []

def uc_create_service_fee(db: Session, fee_type: str, amount: float, accountant_id: int):
    try:
        # Kiểm tra nếu phí đã tồn tại thì cập nhật đơn giá, chưa có thì tạo mới
        existing_fee = db.query(ServiceFee).filter(ServiceFee.serviceName == fee_type).first()
        if existing_fee:
            existing_fee.unitPrice = amount
            msg = f"Cập nhật đơn giá phí {fee_type} thành công."
        else:
            new_fee = ServiceFee(
                serviceName=fee_type,
                unitPrice=amount,
                buildingID="B01" # Mặc định hoặc lấy từ config
            )
            db.add(new_fee)
            msg = f"Tạo đơn giá phí {fee_type} thành công."
        
        db.commit()
        system_log(accountant_id, msg)
        return True, msg
    except Exception as e:
        db.rollback()
        return False, str(e)

def uc_fee_calculate(db: Session, month: int, year: int, accountant_id: int):
    deadline_date = dt.date(year, month, 10)
    existing_bills = db.query(Bill).filter(Bill.deadline == deadline_date).all()
    if existing_bills:
        return "EXISTED", len(existing_bills), []
    return execute_calculation(db, month, year, deadline_date, accountant_id)

def delete_old_bills(db: Session, month: int, year: int):
    deadline_date = dt.date(year, month, 10)
    try:
        old_ids = [b.billID for b in db.query(Bill).filter(Bill.deadline == deadline_date).all()]
        if old_ids:
            db.query(TransactionDetail).filter(TransactionDetail.billID.in_(old_ids)).delete(synchronize_session=False)
            db.query(Bill).filter(Bill.billID.in_(old_ids)).delete(synchronize_session=False)
            db.commit()
        return True
    except:
        db.rollback()
        return False