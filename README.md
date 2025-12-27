# BlueMoon - Hệ thống Quản lý Chung cư

## Cấu trúc thư mục

```
BlueMoon/
│
├── backend/                                    # Backend API (FastAPI + Python)
│   ├── main.py                                 # Entry point - Khởi động server FastAPI
│   ├── requirement.txt                         # Dependencies Python
│   ├── .env                                    # Biến môi trường (DB_URL, SECRET_KEY)
│   ├── .env.example                            # Template cho file .env
│   │
│   └── app/                                    # Source code chính
│       ├── api/                                # API Endpoints (Routes/Controllers)
│       │   ├── __init__.py
│       │   └── auth.py                         # Authentication endpoints (login, me)
│       │
│       ├── core/                               # Core utilities
│       │   ├── db.py                           # Database connection, session management
│       │   └── security.py                     # JWT token, password hashing (bcrypt)
│       │
│       ├── models/                             # SQLAlchemy ORM Models
│       │   ├── __init__.py
│       │   ├── base.py                         # Base class cho tất cả models
│       │   ├── account.py                      # Model Account
│       │   ├── building_manager.py             # Model BuildingManager
│       │   ├── accountant.py                   # Model Accountant
│       │   ├── building.py                     # Model Building
│       │   ├── apartment.py                    # Model Apartment
│       │   ├── resident.py                     # Model Resident
│       │   ├── bill.py                         # Model Bill
│       │   ├── service_fee.py                  # Model ServiceFee
│       │   ├── payment_transaction.py          # Model PaymentTransaction
│       │   └── transaction_detail.py           # Model TransactionDetail
│       │
│       └── schemas/                            # Pydantic Schemas (Request/Response)
│           ├── __init__.py
│           ├── auth.py                         # Login, Token schemas
│           ├── account.py                      # Account schemas
│           ├── building.py                     # Building, BuildingManager schemas
│           ├── apartment.py                    # Apartment schemas
│           ├── resident.py                     # Resident schemas
│           ├── bill.py                         # Bill schemas
│           ├── service_fee.py                  # ServiceFee schemas
│           ├── payment.py                      # Payment, Transaction schemas
│           └── accountant.py                   # Accountant schemas
│
├── CHANGELOG.md                                # Lịch sử thay đổi
├── README.md                                   # File này
```

## Giải thích các thành phần

### Backend (`backend/`)
Backend được xây dựng theo kiến trúc phân tầng (Layered Architecture):

#### 1. API Layer (`app/api/`)
- Chứa các router/endpoint handlers
- Nhận request từ client, validate input
- Gọi business logic và trả về response
- Ví dụ: `auth.py` xử lý login, authentication

#### 2. Core Layer (`app/core/`)
- **db.py**: Quản lý kết nối database, session factory, dependency injection
- **security.py**: JWT token utilities (đơn giản, chỉ 2 functions)

#### 3. Models Layer (`app/models/`)
- SQLAlchemy ORM models
- Map 1-1 với các bảng trong database
- Định nghĩa relationships giữa các entities
- Hỗ trợ query builder và type hints
- Xử lý truy vấn database trực tiếp (thay vì dùng stored procedures)

#### 4. Schemas Layer (`app/schemas/`)
- Pydantic models cho validation
- Định nghĩa cấu trúc request/response
- Tự động tạo OpenAPI documentation
- Type safety và data validation


## Danh sách API Endpoints cần phát triển

### Đã hoàn thành
- `POST /auth/login` - Đăng nhập (UC_LOGIN)
- `GET /auth/me` - Lấy thông tin user hiện tại

### Chức năng chính

#### Quản lý phí (Kế toán)
- `POST /service-fees` - Tạo khoản phí dịch vụ (UC_CREATE_SERVICE_FEE)
- `GET /service-fees` - Lấy danh sách phí dịch vụ
- `PUT /service-fees/{fee_id}` - Cập nhật phí dịch vụ
- `DELETE /service-fees/{fee_id}` - Xóa phí dịch vụ
- `POST /bills/calculate` - Chạy tính phí hàng tháng (UC_FEE)
- `GET /bills` - Xem danh sách công nợ (UC_DETAIL)
- `GET /bills?status=unpaid&month=12&year=2025` - Lọc công nợ theo điều kiện

#### Thanh toán (Kế toán)
- `POST /payments/record` - Ghi nhận thanh toán offline (UC_RECORD)
- `GET /payments/transactions` - Lịch sử giao dịch
- `GET /payments/receipt/{transaction_id}` - Xuất biên lai PDF (UC_BILL)

#### Quản lý căn hộ & cư dân (Admin/BQT)
- `GET /apartments` - Danh sách căn hộ
- `GET /apartments/{id}` - Chi tiết căn hộ
- `POST /apartments` - Thêm căn hộ mới
- `PUT /apartments/{id}` - Cập nhật căn hộ
- `GET /apartments/search?keyword=101` - Tìm kiếm căn hộ (UC_FA)
- `GET /residents` - Danh sách cư dân
- `POST /residents` - Thêm cư dân (UC_UR)
- `PUT /residents/{id}` - Sửa thông tin cư dân (UC_UR)
- `DELETE /residents/{id}` - Xóa cư dân (UC_UR)

### Cư dân
- `GET /bills/my-bills` - Cư dân xem công nợ của mình
- `GET /payments/my-history` - Cư dân xem lịch sử thanh toán (UC_HF)

### Phase 2
- `POST /payments/online` - Thanh toán online qua Sepay (UC_ONLINEPAYMENT)
- `POST /payments/webhook` - Webhook nhận kết quả từ Sepay
- `GET /dashboard/stats` - Thống kê tổng quan (UC_VIEW_DASHBOARD)

### Quản trị hệ thống (Admin)
- `GET /accounts` - Danh sách tài khoản
- `POST /accounts` - Tạo tài khoản mới
- `PUT /accounts/{id}/role` - Phân quyền (UC_AUTH)
- `GET /buildings` - Danh sách tòa nhà
- `POST /buildings` - Thêm tòa nhà
- `PUT /buildings/{id}` - Cập nhật tòa nhà


## Hướng dẫn viết API Endpoint cho người mới

> **Mục tiêu**: Hướng dẫn bạn từng bước tạo một API endpoint hoàn chỉnh, từ nhận request → xử lý → trả về response.

### 📚 Kiến thức cần biết trước

1. **FastAPI**: Framework web Python (như Flask nhưng hiện đại hơn)
2. **SQLAlchemy**: ORM để làm việc với database (thay vì viết SQL thuần)
3. **Pydantic**: Thư viện validate dữ liệu tự động
4. **REST API**: Giao thức HTTP (GET, POST, PUT, DELETE)

### 🎯 Quy trình tạo 1 endpoint

```
1. Tạo file router mới (nếu chưa có)
2. Viết function xử lý request
3. Đăng ký router vào main.py
4. Test API trên Swagger UI
```

---

### Bước 1: Tạo file router mới

**Tạo file trong `backend/app/api/`**, ví dụ `building.py`:

> 💡 **Tip**: Đặt tên file theo resource (building, apartment, payment...), mỗi file chứa các endpoint liên quan

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.db import get_db
from backend.app.schemas.building import BuildingResponse, BuildingCreate
from backend.app.models.building import Building

# Khởi tạo router với prefix và tags
router = APIRouter(prefix="/buildings", tags=["buildings"])
# prefix: Đường dẫn gốc cho tất cả endpoint trong file này
# tags: Nhóm endpoint trong Swagger documentation
============================================
# GET - Lấy danh sách (READ ALL)
# ============================================
@router.get("/", response_model=list[BuildingResponse])
def get_buildings(db: Session = Depends(get_db)):
    """Lấy danh sách tất cả tòa nhà"""
    # Query database bằng ORM
    buildings = db.query(Building).all()
    return buildings
    
# ============================================
# GET - Lấy theo ID (READ ONE)
# ============================================
@router.get("/{building_id}", response_model=BuildingResponse)
def get_building(building_id: int, db: Session = Depends(get_db)):
    """Lấy thông tin tòa nhà theo ID"""
    # Query 1 record dựa trên ID
    building = db.query(Building).filter(Building.id == building_id).first()
    
    # Nếu không tìm thấy, trả về lỗi 404
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
  ============================================
# POST - Tạo mới (CREATE)
# ============================================
@router.post("/", response_model=BuildingResponse, status_code=status.HTTP_201_CREATED)
def create_building(payload: BuildingCreate, db: Session = Depends(get_db)):
    """Tạo tòa nhà mới"""
    # Bước 1: Chuyển Pydantic schema thành SQLAlchemy model
    new_building = Building(**payload.model_dump())
    
    # Bước 2: Thêm vào session
    db.add(new_building)
    
    # Bước 3: Lưu vào database
    db.commit()
    
    # Bước 4: Refresh để lấy dữ liệu mới (ID, timestamp...)
    db.refresh(new_building)
    
    return new_building

# ============================================
# PUT - Cập nhật (UPDATE)
# ============================================
@router.put("/{building_id}", response_model=BuildingResponse)
def update_building(
    building_id: int,
    payload: BuildingCreate,
    db: Session = Depends(get_db)
):
    """Cập nhật thông tin tòa nhà"""
    # Bước 1: Tìm record cần update
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tòa nhà"
        )
    
    # Bước 2: Update từng field
    for key, value in payload.model_dump().items():
        setattr(building, key, value)  # building.name = payload.name
    
    # Bước 3: Commit và refresh
  ============================================
# DELETE - Xóa (DELETE)
# ============================================
@router.delete("/{building_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_building(building_id: int, db: Session = Depends(get_db)):
    """Xóa tòa nhà"""
    # Bước 1: Tìm record cần xóa
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tòa nhà"
        )
    
    # Bước 2: Xóa và commit
    db.delete(building)
    db.commit()
    return None

# Giải thích:
# - status_code=204: No Content (xóa thành công, không trả về gì)
# - db.delete(obj): Đánh dấu object để xóa
# - return None: Không cần trả về dữ liệu

# PUT - Cập nhật
@router.put("/{building_id}", response_model=BuildingResponse)
def update_building(
---

### Bước 2: Đăng ký router vào main.py

**Mở file `backend/main.py`** và thêm:

```python
from backend.app.api.building import router as building_router

# Trong phần cuối file (sau các router khác)
app.include_router(auth_router)
app.include_router(building_router)  # ← Thêm dòng này
```

#### 1. APIRouter
```python
router = APIRouter(prefix="/buildings", tags=["buildings"])
```
- **prefix**: Đường dẫn gốc cho tất cả endpoint (ví dụ: `/buildings`)
- **tags**: Nhóm endpoint trong Swagger documentation

#### 2. Depends(get_db)
```python
def my_endpoint(db: Session = Depends(get_db)):
```
- **Dependency Injection**: FastAPI tự động tạo và đóng database session
- Không cần viết `db = SessionLocal()` thủ công

#### 3. response_model
```python
@router.get("/", response_model=list[BuildingResponse])
```
- Validate dữ liệu trả về theo Pydantic schema
- Tự động convert SQLAlchemy model → JSON
- Lọc bỏ các field không cần thiết

#### 4. status_code
```python
@router.post("/", status_code=status.HTTP_201_CREATED)
```
- **200 OK**: Thành công (mặc định cho GET, PUT)
- **201 Created**: Tạo mới thành công (POST)
- **204 No Content**: Xóa thành công (DELETE)
- **404 Not Found**: Không tìm thấy resource

**Khi nào cần?** Endpoint chỉ cho phép user đã đăng nhập truy cập.

```python
from backend.app.api.auth import get_current_user

@router.get("/my-buildings")
def get_my_buildings(
    current_user: dict = Depends(get_current_user),  # ← Thêm dependency này
    db: Session = Depends(get_db)
):
    """Lấy danh sách tòa nhà của tôi (yêu cầu đăng nhập)"""
    user_id = current_user["id"]
    buildings = db.query(Building).filter(Building.manager_id == user_id).all()
    return buildings
```

> **Cách hoạt động**: FastAPI tự động kiểm tra JWT token trong header. Nếu không có hoặc không hợp lệ → trả về lỗi 401 Unauthorized.

**Test trên Swagger UI**:
1. Click nút **"Authorize"** ở góc trên
2. Nhập token (lấy từ `/auth/login`)
3. Click **"Authorize"** → Đóng dialog
4. Giờ có thể test endpoint yêu cầu đăng nhập
```python
@router.get("/search")
def search_buildings(
    name: str = None,           # Query param: ?name=TowerA
    address: str = None,        # Query param: ?address=Hanoi
    skip: int = 0,              # Pagination: ?skip=10
    limit: int = 10,            # Limit: ?limit=20
    db: Session = Depends(get_db)
):
    """
    Tìm kiếm tòa nhà
    
    URL ví dụ: /buildings/search?name=Tower&address=Hanoi&skip=0&limit=10
    """
    # Bắt đầu với query cơ bản
    query = db.query(Building)
    
    # Thêm filter nếu có tham số
    if name:
        query = query.filter(Building.name.ilike(f"%{name}%"))  # LIKE %name%
    if address:
        query = query.filter(Building.address.ilike(f"%{address}%"))
    
    # Pagination
    buildings = query.offset(skip).limit(limit).all()
    return buildings
```

>  **Giải thích**:
> - `= None`: Tham số không bắt buộc (optional)
> - `.ilike()`: Tìm kiếm không phân biệt HOA/thường
> - `.offset(skip)`: Bỏ qua N records đầu
> - `.limit(limit)`: Lấy tối đa N records

#### Xử lý Transaction (Atomic operations)

```python
@router.post("/bills/calculate")
def calculate_bills(month: int, year: int, db: Session = Depends(get_db)):
    """Chạy tính phí (UC_FEE) - Transaction atomic"""
    try:
        # Bắt đầu transaction
        apartments = db.query(Apartment).filter(Apartment.status == 'active').all()
        
        for apt in apartments:
            # Tính tổng phí
            total = calculate_fees(apt, month, year)
            
            # Tạo bill mới
            new_bill = Bill(
                apartment_id=apt.id,
                month=month,
                year=year,
                total=total,
                status='Unpaid'
            )
            db.add(new_bill)
        
        # Commit tất cả cùng lúc
        db.commit()
        return {"message": f"Tạo thành công {len(apartments)} bills"}
        
    except Exception as e:
        # Nếu có lỗi, rollback tất cả
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi: {str(e)}")
```

>  **Quan trọng**: Nếu 1 bill failed → rollback tất cả (tính toàn vẹn dữ liệu)

---

### Checklist khi viết endpoint mới

- [ ] Đã tạo file router trong `app/api/`
- [ ] Đã import đầy đủ dependencies (FastAPI, SQLAlchemy, schemas)
- [ ] Đã định nghĩa `response_model` cho mỗi endpoint
- [ ] Đã xử lý lỗi với `HTTPException` (404, 400, 500...)
- [ ] Đã thêm docstring cho endpoint
- [ ] Đã `include_router()` trong `main.py`
- [ ] Đã test trên Swagger UI (`/docs`)
- [ ] Đã commit database transaction (`.commit()`)
- [ ] Đã xử lý transaction rollback (nếu cần)

---

### Lỗi thường gặp và cách fix

#### 1. "No module named 'backend.app.api.xxx'"
**Nguyên nhân**: Chưa import đúng hoặc file không tồn tại.  
**Fix**: Kiểm tra lại đường dẫn import và tên file.

#### 2. "422 Unprocessable Entity"
**Nguyên nhân**: Dữ liệu request không khớp với Pydantic schema.  
**Fix**: Kiểm tra lại các field bắt buộc trong schema.

#### 3. "500 Internal Server Error"
**Nguyên nhân**: Lỗi trong code (query sai, thiếu commit, logic lỗi).  
**Fix**: Xem log trong terminal để debug.

#### 4. "401 Unauthorized"
**Nguyên nhân**: Endpoint yêu cầu đăng nhập nhưng không có token.  
**Fix**: Click "Authorize" trên Swagger và nhập token.

---

### Tips cho người mới

1. **Copy-paste là bạn**: Sao chép endpoint có sẵn và chỉnh sửa, đừng viết từ đầu.
2. **Test ngay sau khi viết**: Đừng viết nhiều endpoint cùng lúc, test từng cái một.
3. **Đọc log**: Terminal hiển thị lỗi rất chi tiết, đọc kỹ để biết sai ở đâu.
4. **Dùng Swagger UI**: Giao diện test API tuyệt vời, không cần Postman.
5. **Commit thường xuyên**: Sau mỗi endpoint hoạt động, commit code ngay.

---

### Tài liệu tham khảo

- FastAPI: https://fastapi.tiangolo.com/
- SQLAlchemy: https://docs.sqlalchemy.org/
- Pydantic: https://docs.pydantic.dev/

### Bước 3: Các thành phần chính

**APIRouter**: Tạo router với:
- `prefix`: Đường dẫn gốc (ví dụ: `/buildings`)
- `tags`: Nhóm endpoints trong documentation

**Depends(get_db)**: Dependency injection để lấy database session

**response_model**: Pydantic schema để validate và serialize response

**status_code**: HTTP status code trả về (200, 201, 204, 404, etc.)

**HTTPException**: Raise lỗi với status code và thông báo

### Bước 4: Sử dụng Authentication (tuỳ chọn)

Nếu endpoint cần yêu cầu đăng nhập:

```python
from backend.app.api.auth import get_current_user

@router.get("/protected")
def protected_route(current_user: dict = Depends(get_current_user)):
    """Route yêu cầu đăng nhập"""
    return {"message": f"Xin chào {current_user['username']}"}
```

### Bước 5: Kiểm tra API

Sau khi viết xong, truy cập API documentation tại:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Các HTTP Methods thường dùng

- **GET**: Lấy dữ liệu (danh sách hoặc chi tiết)
- **POST**: Tạo mới dữ liệu
- **PUT**: Cập nhật toàn bộ dữ liệu
- **PATCH**: Cập nhật một phần dữ liệu
- **DELETE**: Xóa dữ liệu

### Ví dụ xử lý Query Parameters

```python
@router.get("/search")
def search_buildings(
    name: str = None,
    address: str = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Tìm kiếm tòa nhà theo tên và địa chỉ"""
    query = db.query(Building)
    
    if name:
        query = query.filter(Building.name.ilike(f"%{name}%"))
    if address:
        query = query.filter(Building.address.ilike(f"%{address}%"))
    
    buildings = query.offset(skip).limit(limit).all()
    return buildings
```

### Lưu ý quan trọng

1. Luôn validate dữ liệu đầu vào bằng Pydantic schemas
2. Xử lý lỗi đầy đủ với HTTPException
3. Sử dụng response_model để đảm bảo format dữ liệu trả về
4. Viết docstring cho mỗi endpoint để tự động tạo documentation
5. Commit database transaction sau mỗi thay đổi
6. Sử dụng refresh() để lấy dữ liệu mới sau khi commit