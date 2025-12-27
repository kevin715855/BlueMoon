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

### Database (`database/`)
Chứa tất cả SQL scripts:
- **init.sql**: Tạo cấu trúc database (tables, indexes, constraints)
- **procedure.sql**: Stored procedures (một số vẫn giữ cho logic phức tạp)
- **seed.sql**: Dữ liệu mẫu để test
- **diagram.pdf**: Sơ đồ quan hệ giữa các bảng

### Documentation (`docs/`)
Tài liệu hướng dẫn chi tiết:
- **API_IMPLEMENTATION_GUIDE.md**: Cách viết API endpoints
- **AUTH_GUIDE.md**: Hướng dẫn authentication (JWT đã đơn giản hóa)
- **ORM_GUIDE.md**: Làm việc với SQLAlchemy ORM
- **SCHEMAS_GUIDE.md**: Pydantic schemas và validation
- Các sơ đồ kiến trúc (PNG files)

### Testing (`test_auth_manual.py`)
Script test thủ công các tính năng authentication

---

## Hướng dẫn viết API Endpoint

### Bước 1: Tạo file router mới

Tạo file trong thư mục `backend/app/api/`, ví dụ `building.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.db import get_db
from backend.app.schemas.building import BuildingResponse, BuildingCreate
from backend.app.models.building import Building

# Khởi tạo router với prefix và tags
router = APIRouter(prefix="/buildings", tags=["buildings"])


# GET - Lấy danh sách
@router.get("/", response_model=list[BuildingResponse])
def get_buildings(db: Session = Depends(get_db)):
    """Lấy danh sách tất cả tòa nhà"""
    buildings = db.query(Building).all()
    return buildings


# GET - Lấy theo ID
@router.get("/{building_id}", response_model=BuildingResponse)
def get_building(building_id: int, db: Session = Depends(get_db)):
    """Lấy thông tin tòa nhà theo ID"""
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tòa nhà"
        )
    return building


# POST - Tạo mới
@router.post("/", response_model=BuildingResponse, status_code=status.HTTP_201_CREATED)
def create_building(payload: BuildingCreate, db: Session = Depends(get_db)):
    """Tạo tòa nhà mới"""
    new_building = Building(**payload.model_dump())
    db.add(new_building)
    db.commit()
    db.refresh(new_building)
    return new_building


# PUT - Cập nhật
@router.put("/{building_id}", response_model=BuildingResponse)
def update_building(
    building_id: int,
    payload: BuildingCreate,
    db: Session = Depends(get_db)
):
    """Cập nhật thông tin tòa nhà"""
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tòa nhà"
        )
    
    for key, value in payload.model_dump().items():
        setattr(building, key, value)
    
    db.commit()
    db.refresh(building)
    return building


# DELETE - Xóa
@router.delete("/{building_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_building(building_id: int, db: Session = Depends(get_db)):
    """Xóa tòa nhà"""
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tòa nhà"
        )
    
    db.delete(building)
    db.commit()
    return None
```

### Bước 2: Đăng ký router trong main.py

Thêm vào file `backend/main.py`:

```python
from backend.app.api.building import router as building_router

# Trong phần cuối file
app.include_router(auth_router)
app.include_router(building_router)  # Thêm router mới
```

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