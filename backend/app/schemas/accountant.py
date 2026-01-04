from pydantic import BaseModel, ConfigDict, Field

# 1. Base Schema (Chứa các trường chung)
class AccountantBase(BaseModel):
    username: str | None = Field(default=None, max_length=50)
    fullname: str | None = Field(default=None, max_length=100)
    phoneNumber: str | None = Field(default=None, max_length=20)

# 2. Schema dùng để Tạo mới
class AccountantCreate(AccountantBase):
    pass

# 3. Schema dùng để Cập nhật 
class AccountantUpdate(BaseModel):
    username: str | None = Field(default=None, max_length=50)
    fullname: str | None = Field(default=None, max_length=100)
    phoneNumber: str | None = Field(default=None, max_length=20)

# 4. Schema dùng để Đọc dữ liệu trả về (Read)
class AccountantRead(AccountantBase):
    model_config = ConfigDict(from_attributes=True)

    accountantID: int