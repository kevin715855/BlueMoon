# CHANGELOG

## [Unreleased]

### Added - Authentication & Authorization (2025-12-26)

#### Authentication System
- **JWT-based Authentication**: Implement đầy đủ login flow với JWT tokens
  - Login endpoint: `POST /auth/login`
  - Get current user: `GET /auth/me`
  - JWT token generation và validation
  - Bearer token authentication

#### Security Features
- **Password Hashing**: Bcrypt password hashing utilities (ready for database migration)
- **Token Management**: 
  - 24-hour token expiration
  - Secure token decode với error handling
  - Secret key configuration từ environment

#### Dependencies Added
- `python-jose[cryptography]` - JWT encoding/decoding
- `passlib[bcrypt]` - Password hashing
- `python-multipart` - Form data support

#### New Files Created
- `backend/app/core/security.py` - JWT và password utilities
- `backend/app/db/procedures.py` - Stored procedure wrappers
- `docs/AUTH_GUIDE.md` - Chi tiết authentication documentation
- `test_auth_manual.py` - Manual testing script

---

### Added - Pydantic Schemas (2025-12-26)

#### Request/Response Validation
Hoàn thiện Pydantic schemas với validation rules, examples, và documentation cho tất cả entities:

### Added - Pydantic Schemas (2025-12-26)

Request/Response Validation - Pydantic schemas với validation rules, examples cho tất cả entities:

Authentication (backend/app/schemas/auth.py):
- LoginRequest, LoginResponse, TokenData, MeResponse

Building (backend/app/schemas/building.py):
- BuildingManagerCreate/Update/Read, BuildingCreate/Update/Read
- Validation: Phone format (10-15 digits)

Apartment (backend/app/schemas/apartment.py):
- ApartmentCreate/Update/Read
- Validation: numResident >= 0

Resident (backend/app/schemas/resident.py):
- ResidentCreate/Update/Read, ResidentSearchQuery
- Validation: Age 0-150, phone format

Bill (backend/app/schemas/bill.py):
- BillCreate/Update/Read, BillQueryParams, BillListResponse
- Validation: Amount > 0, total >= amount, deadline >= today

ServiceFee (backend/app/schemas/service_fee.py):
- ServiceFeeCreate/Update/Read
- Validation: unitPrice > 0

Payment (backend/app/schemas/payment.py):
- PaymentTransactionCreate/Update/Read, PaymentRequest, PaymentResponse
- TransactionDetailCreate/Read, MarkPaymentSuccessRequest/Response
- Validation: Amount > 0

Schema Features:
- Type Safety: Tất cả fields có type hints
- Validation: Custom validators cho phone, dates, amounts
- Documentation: Description cho mọi field
- Examples: JSON examples cho Swagger UI
- ORM Mode: ConfigDict(from_attributes=True) cho SQLAlchemy

### Added - ORM Layer (2025-12-26)

Thêm 10 bảng: Account, BuildingManager, Accountant, Building, Apartment, Resident, Bill, ServiceFee, PaymentTransaction, TransactionDetail lấy từ SQL ALchemy

DB Config (backend/app/core/):
- db.py: Đọc DB URL từ .env, SQLAlchemy engine, session factory, dependency injection
- pool_pre_ping=True kiểm tra connection
- get_db() dependency cho FastAPI endpoints
- get_secret_key() cho JWT configuration

Models Features:
- Relationships: Tất cả models có quan hệ 1-nhiều
- Indexes: Map đầy đủ indexes từ SQL schema

Project Structure:
```
backend/app/models/
├── __init__.py
├── base.py
├── account.py
├── building_manager.py
├── accountant.py
├── building.py
├── apartment.py
├── resident.py
├── bill.py
├── service_fee.py
├── payment_transaction.py
└── transaction_detail.py
```

Railway Database: cần khởi tạo DB_URL trong backend\.env (Tự tạo file)

## Next Steps

- Tạo Pydantic schemas (Done)
- Thêm authentication (Done)
- Implement CRUD service layer
- Viết API endpoints sử dụng ORM models
- Unit tests
- Integration tests
