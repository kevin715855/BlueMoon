"""
Pydantic schemas cho Building Manager
"""
from pydantic import BaseModel, ConfigDict, Field, field_validator
import re

# ==================== BUILDING MANAGER ====================

class BuildingManagerBase(BaseModel):
    """Base schema cho Building Manager"""
    name: str = Field(..., max_length=100, description="Tên quản lý tòa nhà")
    phoneNumber: str | None = Field(
        default=None, max_length=15, description="Số điện thoại")
    username: str | None = Field(
        default=None, max_length=50, description="Username liên kết với tài khoản")

    @field_validator('phoneNumber')
    @classmethod
    def validate_phone(cls, v):
        if v and not re.match(r'^[0-9]{10,15}$', v):
            raise ValueError('Số điện thoại phải từ 10-15 chữ số')
        return v


class BuildingManagerCreate(BuildingManagerBase):
    """Tạo Building Manager mới"""

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Nguyễn Văn A",
                "phoneNumber": "0123456789",
                "username": "manager01"
            }
        }


class BuildingManagerUpdate(BaseModel):
    """Cập nhật Building Manager"""
    
    name: str | None = Field(default=None, max_length=100)
    phoneNumber: str | None = Field(default=None, max_length=15)
    username: str | None = Field(default=None, max_length=50)


    @field_validator('phoneNumber')
    @classmethod
    def validate_phone(cls, v):
        if v and not re.match(r'^[0-9]{10,15}$', v):
            raise ValueError('Số điện thoại phải từ 10-15 chữ số')
        return v


class BuildingManagerRead(BuildingManagerBase):
    """Response Building Manager"""
    model_config = ConfigDict(from_attributes=True)

    managerID: int = Field(..., description="ID của quản lý")

class BuildingManagerAssignment(BaseModel):
    managerID: int | None = Field(
        default=None, 
        description="ID quản lý (gửi null để bỏ quản lý)",
        alias="manager_id"
    ) 

    class Config:
        populate_by_name = True