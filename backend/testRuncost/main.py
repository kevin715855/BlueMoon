import sys
from database import SessionLocal
from function import uc_create_service_fee, uc_fee_calculate, delete_old_bills, execute_calculation
from backend.app.models.apartment import Apartment
from backend.app.models.accountant import Accountant
import datetime as dt

def main():
    db = SessionLocal()
    accountant = db.query(Accountant).first()
    acc_id = accountant.accountantID if accountant else 1

    while True:
        print("\n" + "="*50)
        print("HỆ THỐNG QUẢN LÝ TÀI CHÍNH CHUNG CƯ")
        print("1. Thiết lập đơn giá phí (Service Fee)")
        print("2. Chạy tính phí & Gửi thông báo (Nhập chỉ số)")
        print("3. Thoát")
        choice = input("Lựa chọn: ")

        if choice == "1":
            print("\n--- CHỌN LOẠI PHÍ CẦN THIẾT LẬP ---")
            print("1. Điện (tính theo kWh)")
            print("2. Nước (tính theo m3)")
            print("3. Phí quản lý (tính theo m2)")
            print("4. Internet (cố định)")
            print("5. Khác")
            
            type_choice = input("Chọn loại phí (1-5): ")
            fee_map = {
                "1": "Điện",
                "2": "Nước",
                "3": "Phí quản lý",
                "4": "Internet",
                "5": "Khác"
            }
            
            fee_name = fee_map.get(type_choice)
            if not fee_name:
                print("Lựa chọn không hợp lệ.")
                continue
            
            if type_choice == "5":
                fee_name = input("Nhập tên loại phí khác: ")

            try:
                amount = float(input(f"Nhập đơn giá cho {fee_name} (VNĐ): "))
                if amount <= 0 or amount > 1000000000:
                    print(">> Lỗi: Số tiền không hợp lệ (phải từ 0 đến 1 tỷ).")
                    continue
                
                success, msg = uc_create_service_fee(db, fee_name, amount, acc_id)
                print(f">> {msg}")
            except ValueError:
                print(">> Lỗi: Vui lòng nhập số tiền là chữ số.")

        elif choice == "2":
            try:
                month = int(input("Tính phí cho tháng: "))
                year = int(input("Năm: "))
                
                result = uc_fee_calculate(db, month, year, acc_id)
                
                if result[0] == "EXISTED":
                    print(f">> CẢNH BÁO: Kỳ {month}/{year} đã có {result[1]} hóa đơn.")
                    conf = input("Bạn có muốn XÓA CŨ, GHI ĐÈ và gửi lại thông báo không? (Đồng ý/Hủy): ")
                    if conf == "Đồng ý":
                        delete_old_bills(db, month, year)
                        res, count, _ = execute_calculation(db, month, year, dt.date(year, month, 10), acc_id)
                        print(f">> Đã ghi đè thành công {count} hóa đơn.")
                elif result[0] == "SUCCESS":
                    print(f">> Đã hoàn tất tính phí cho {result[1]} hóa đơn.")
                else:
                    print(f">> Lỗi: {result[1]}")
            except Exception as e:
                print(f"Lỗi hệ thống: {e}")

        elif choice == "3":
            break
    db.close()

if __name__ == "__main__":
    main()