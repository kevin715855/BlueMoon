"""
Pydantic schemas cho Building và BuildingManager
"""
from pydantic import BaseModel, ConfigDict, Field, field_validator
import re



# ==================== BUILDING ====================

class BuildingBase(BaseModel):
    """Base schema cho Building"""
    buildingID: str = Field(..., max_length=10,
                            description="Mã tòa nhà (VD: A, B, C)")
    managerID: int | None = Field(
        default=None, description="ID quản lý phụ trách")
    address: str | None = Field(
        default=None, max_length=200, description="Địa chỉ tòa nhà")
    numApartment: int | None = Field(
        default=None, ge=0, description="Số lượng căn hộ")


class BuildingCreate(BuildingBase):
    """Schema cho tạo Building mới"""

    class Config:
        json_schema_extra = {
            "example": {
                "buildingID": "A",
                "managerID": 1,
                "address": "123 Đường ABC, Hà Nội",
                "numApartment": 50
            }
        }


class BuildingUpdate(BaseModel):
    """Schema cho cập nhật Building"""
    managerID: int | None = Field(default=None, ge=0)
    address: str | None = Field(default=None, max_length=200)
    numApartment: int | None = Field(default=None, ge=0)


class BuildingRead(BuildingBase):
    """Schema cho response Building"""
    model_config = ConfigDict(from_attributes=True)
