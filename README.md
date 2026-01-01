# 🏢 BlueMoon - Hệ thống Quản lý Chung cư

Hệ thống quản lý chung cư toàn diện với FastAPI backend và React frontend.

## 🚀 Tính năng chính

### 👤 Phân quyền 4 vai trò
- **Admin**: Quản trị toàn hệ thống
- **Building Manager**: Quản lý tòa nhà, căn hộ, cư dân
- **Accountant**: Quản lý hóa đơn, thanh toán, biên lai
- **Resident**: Xem hóa đơn, thanh toán trực tuyến

### 💳 Thanh toán
- Thanh toán online qua QR Code (SePay)
- Thanh toán offline (tiền mặt/chuyển khoản)
- Xuất biên lai PDF
- Lịch sử giao dịch

### 📊 Quản lý
- Tòa nhà và căn hộ
- Cư dân
- Hóa đơn dịch vụ (điện, nước, internet...)
- Thống kê dashboard

## 📁 Cấu trúc

```
backend/       
  ├── app/
  │   ├── api/    # API endpoints
  │   ├── models/ # Database models
  │   ├── schemas/# Pydantic schemas
  │   └── core/   # DB, Security
  └── main.py

frontend/         
  └── src/
      ├── components/
      ├── services/
      └── hooks/

```

## ⚙️ Setup

### Backend
```bash

pip install -r backend\requirement.txt
python run.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 👥 Team - Nhóm 18

| Họ tên | MSSV | Email |
|--------|------|-------|
| Trịnh Ngọc Ninh | 20230055 | ninh.tn230055@sis.hust.edu.vn |
| Trần Trung Kiên | 20235130 | kien.tt235130@sis.hust.edu.vn |
| Lưu Trọng Nghĩa | 20235178 | nghia.lt235178@sis.hust.edu.vn |
| Mai Tiến Hoàng | 20235085 | hoang.mt235085@sis.hust.edu.vn |
| Đỗ Đức Thành | 20235222 | thanh.dd235222@sis.hust.edu.vn |

**HUST - CNPM Project**



## 📝 License






