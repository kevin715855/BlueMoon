# 📚 BlueMoon API - Bảng Phân Quyền

## Quyền truy cập API theo Role

| Method | Endpoint | Mô tả | Resident | Accountant | Manager | Admin |
|--------|----------|-------|:--------:|:----------:|:-------:|:-----:|
| **Authentication** |
| POST | `/api/auth/login` | Đăng nhập | ✅ | ✅ | ✅ | ✅ |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại | ✅ | ✅ | ✅ | ✅ |
| **Account Management** |
| POST | `/api/accounts/account` | Tạo tài khoản mới | ❌ | ❌ | ✅ | ✅ |
| GET | `/api/accounts/managers/{username}` | Xem chi tiết tài khoản | ❌ | ❌ | ✅ | ✅ |
| DELETE | `/api/accounts/{username}` | Vô hiệu hóa tài khoản | ❌ | ❌ | ✅ | ✅ |
| PATCH | `/api/accounts/managers/{username}/role` | Chỉnh sửa quyền tài khoản | ❌ | ❌ | ✅ | ✅ |
| PATCH | `/api/accounts/managers/{username}/password` | Đổi mật khẩu | ❌ | ❌ | ✅ | ✅ |
| **Building Managers** |
| GET | `/api/building-managers/` | Danh sách quản lý tòa nhà | ❌ | ❌ | ✅ | ✅ |
| GET | `/api/building-managers/{manager_id}` | Chi tiết quản lý | ❌ | ❌ | ✅ | ✅ |
| POST | `/api/building-managers/` | Tạo quản lý mới | ❌ | ❌ | ✅ | ✅ |
| PATCH | `/api/building-managers/{manager_id}` | Cập nhật quản lý | ❌ | ❌ | ✅ | ✅ |
| DELETE | `/api/building-managers/{manager_id}` | Xóa quản lý | ❌ | ❌ | ✅ | ✅ |
| **Buildings** |
| GET | `/api/buildings/manager/{manager_id}` | Xem tòa nhà của quản lý | ❌ | ❌ | ✅ | ✅ |
| PUT | `/api/buildings/{building_id}/manager` | Cập nhật quản lý cho tòa nhà | ❌ | ❌ | ✅ | ✅ |
| **Accountants** |
| GET | `/api/accountants/` | Danh sách kế toán | ❌ | ❌ | ✅ | ✅ |
| GET | `/api/accountants/{accountant_id}` | Chi tiết kế toán | ❌ | ❌ | ✅ | ✅ |
| POST | `/api/accountants/` | Tạo kế toán mới | ❌ | ❌ | ✅ | ✅ |
| PATCH | `/api/accountants/{accountant_id}` | Cập nhật kế toán | ❌ | ❌ | ✅ | ✅ |
| DELETE | `/api/accountants/{accountant_id}` | Xóa kế toán | ❌ | ❌ | ✅ | ✅ |
| **Residents** |
| GET | `/api/residents/get-residents-data` | Danh sách cư dân | ❌ | ❌ | ✅ | ✅ |
| GET | `/api/residents/resident_detail` | Chi tiết cư dân | ❌ | ❌ | ✅ | ✅ |
| POST | `/api/residents/add-new-resident` | Thêm cư dân mới | ❌ | ❌ | ✅ | ✅ |
| PUT | `/api/residents/{id}` | Cập nhật cư dân | ❌ | ❌ | ✅ | ✅ |
| DELETE | `/api/residents/{id}` | Xóa cư dân | ❌ | ❌ | ✅ | ✅ |
| **Apartments** |
| GET | `/api/apartments/get-apartments-data` | Danh sách căn hộ | ❌ | ✅ | ✅ | ✅ |
| **Bills** |
| GET | `/api/bills/my-bills` | Xem hóa đơn của tôi | ✅ | ❌ | ❌ | ✅ |
| **Payments** |
| GET | `/api/payments/my-history` | Lịch sử giao dịch của tôi | ✅ | ❌ | ❌ | ✅ |
| POST | `/api/payments/create-qr` | Tạo mã QR thanh toán | ✅ | ❌ | ❌ | ✅ |
| **Offline Payments** |
| POST | `/api/offline-payments/offline_payment` | Thanh toán ngoại tuyến | ❌ | ✅ | ❌ | ✅ |
| **Receipts** |
| GET | `/api/receipts/{transaction_id}` | Xuất biên lai thanh toán | ❌ | ✅ | ❌ | ✅ |
| **Meta** |
| GET | `/` | API information | ✅ | ✅ | ✅ | ✅ |
| GET | `/health` | Health check | ✅ | ✅ | ✅ | ✅ |
