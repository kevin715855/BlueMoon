"""
Pydantic schemas cho Resident
"""
import datetime as dt
from pydantic import BaseModel, ConfigDict, Field, field_validator
import re


class ResidentBase(BaseModel):
    """Base schema cho Resident"""
    apartmentID: str | None = Field(
        default=None, max_length=10, description="Mã căn hộ")
    fullName: str = Field(..., max_length=100, description="Họ tên đầy đủ")
    age: int | None = Field(default=None, ge=0, le=150, description="Tuổi")
    date: dt.date | None = Field(default=None, description="Ngày bắt đầu ở")
    phoneNumber: str | None = Field(
        default=None, max_length=15, description="Số điện thoại")
    isOwner: bool = Field(default=False, description="Là chủ hộ hay không")
    username: str | None = Field(
        default=None, max_length=50, description="Username liên kết")

    @field_validator('phoneNumber')
    @classmethod
    def validate_phone(cls, v):
        if v and not re.match(r'^[0-9]{10,15}$', v):
            raise ValueError('Số điện thoại phải từ 10-15 chữ số')
        return v


class ResidentCreate(ResidentBase):
    """Schema cho tạo Resident mới"""

    class Config:
        json_schema_extra = {
            "example": {
                "apartmentID": "A101",
                "fullName": "Nguyễn Văn B",
                "age": 30,
                "date": "2025-01-01",
                "phoneNumber": "0987654321",
                "isOwner": True,
                "username": "resident01"
            }
        }


class ResidentUpdate(BaseModel):
    """Schema cho cập nhật Resident"""
    apartmentID: str | None = Field(default=None, max_length=10)
    fullName: str | None = Field(default=None, max_length=100)
    age: int | None = Field(default=None, ge=0, le=150)
    date: dt.date | None = None
    phoneNumber: str | None = Field(default=None, max_length=15)
    isOwner: bool | None = None
    username: str | None = Field(default=None, max_length=50)

    @field_validator('phoneNumber')
    @classmethod
    def validate_phone(cls, v):
        if v and not re.match(r'^[0-9]{10,15}$', v):
            raise ValueError('Số điện thoại phải từ 10-15 chữ số')
        return v


class ResidentRead(ResidentBase):
    """Schema cho response Resident"""
    model_config = ConfigDict(from_attributes=True)

    residentID: int = Field(..., description="ID cư dân")


class ResidentSearchQuery(BaseModel):
    """
    Schema cho search/filter residents
    Dùng với stored procedure sp_list_residents
    """
    buildingID: str | None = Field(
        default=None, max_length=10, description="Lọc theo tòa nhà")
    apartmentID: str | None = Field(
        default=None, max_length=10, description="Lọc theo căn hộ")
    isOwner: bool | None = Field(
        default=None, description="Lọc chủ hộ (true/false)")
    keyword: str | None = Field(
        default=None, max_length=100,
        description="Tìm kiếm theo tên, SĐT, hoặc username"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "buildingID": "A",
                "apartmentID": None,
                "isOwner": True,
                "keyword": "Nguyen"
            }
        }
