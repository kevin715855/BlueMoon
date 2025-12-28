# BlueMoon - Hệ thống Quản lý Chung cư

## 📁 Cấu trúc Project

```
backend/
├── main.py              # Entry point
├── requirement.txt      # Dependencies
├── .env                 # Config (DB_URL, SECRET_KEY)
└── app/
    ├── api/             # API endpoints (auth.py)
    ├── core/            # Utils (db.py, security.py)
    ├── models/          # SQLAlchemy ORM
    └── schemas/         # Pydantic validation
```

## 🏗️ Kiến trúc Backend

**Layered Architecture:**
- **API Layer**: Nhận request, trả response
- **Core Layer**: Database, JWT token
- **Models Layer**: ORM mapping với DB
- **Schemas Layer**: Validate input/output


## 🚀 API Endpoints

### ✅ Đã hoàn thành
- `POST /auth/login` - Đăng nhập
- `GET /auth/me` - Thông tin user (cần token)
- `POST /auth/logout` - Đăng xuất (cần token)

### 📋 Cần phát triển

**Quản lý phí (Kế toán)**
- `POST /service-fees` - Tạo phí dịch vụ
- `POST /bills/calculate` - Tính phí hàng tháng
- `GET /bills` - Xem công nợ

**Thanh toán (Kế toán)**
- `POST /payments/record` - Ghi nhận thanh toán
- `GET /payments/transactions` - Lịch sử giao dịch
- `GET /payments/receipt/{id}` - Xuất biên lai PDF

**Quản lý căn hộ & cư dân (BQT)**
- `GET /apartments` - Danh sách căn hộ
- `POST /apartments` - Thêm căn hộ
- `GET /residents` - Danh sách cư dân
- `POST /residents` - Thêm cư dân

**Cư dân**
- `GET /bills/my-bills` - Xem công nợ của mình
- `GET /payments/my-history` - Lịch sử thanh toán

---


## 📖 Hướng dẫn viết API Endpoint

### Quy trình cơ bản
1. Tạo file router trong `app/api/`
2. Import dependencies (FastAPI, SQLAlchemy, schemas)
3. Đăng ký router vào `main.py`
4. Test trên Swagger UI (`/docs`)

### Ví dụ: CRUD cơ bản

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.db import get_db

router = APIRouter(prefix="/buildings", tags=["buildings"])

# GET - Lấy danh sách
@router.get("/")
def get_buildings(db: Session = Depends(get_db)):
    return db.query(Building).all()

# POST - Tạo mới
@router.post("/", status_code=201)
def create_building(data: BuildingCreate, db: Session = Depends(get_db)):
    building = Building(**data.model_dump())
    db.add(building)
    db.commit()
    db.refresh(building)
    return building

# PUT - Cập nhật
@router.put("/{id}")
def update_building(id: int, data: BuildingCreate, db: Session = Depends(get_db)):
    building = db.query(Building).filter(Building.id == id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in data.model_dump().items():
        setattr(building, key, value)
    db.commit()
    return building

# DELETE - Xóa
@router.delete("/{id}", status_code=204)
def delete_building(id: int, db: Session = Depends(get_db)):
    building = db.query(Building).filter(Building.id == id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(building)
    db.commit()
```

### Sử dụng Authentication

```python
from backend.app.api.auth import get_current_user, require_role

# Endpoint cần login
@router.get("/protected")
def protected(current_user = Depends(get_current_user)):
    return {"user": current_user.username}

# Endpoint cần role cụ thể
@router.post("/admin-only")
def admin_only(current_user = Depends(require_role("BUILDING_MANAGER"))):
    return {"message": "Only manager can access"}
```

### Checklist
- [ ] Import đầy đủ dependencies
- [ ] Định nghĩa `response_model`
- [ ] Xử lý lỗi với `HTTPException`
- [ ] Commit transaction (`.commit()`)


Project sử dụng **JWT (JSON Web Token)** để xác thực người dùng:




