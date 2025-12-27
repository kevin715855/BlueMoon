"""
Pydantic schemas cho ServiceFee
"""
from pydantic import BaseModel, ConfigDict, Field


class ServiceFeeCreate(BaseModel):
    """Schema cho tạo ServiceFee mới"""
    serviceName: str = Field(..., max_length=100,
                             description="Tên dịch vụ (bắt buộc)")
    unitPrice: float = Field(..., gt=0, description="Đơn giá phải > 0")
    buildingID: str = Field(..., max_length=10,
                            description="Mã tòa nhà (bắt buộc)")

    class Config:
        json_schema_extra = {
            "example": {
                "serviceName": "Phí quản lý",
                "unitPrice": 15000,
                "buildingID": "A"
            }
        }


class ServiceFeeUpdate(BaseModel):
    """Schema cho cập nhật ServiceFee"""
    serviceName: str | None = Field(default=None, max_length=100)
    unitPrice: float | None = Field(default=None, ge=0)
    buildingID: str | None = Field(default=None, max_length=10)


class ServiceFeeRead(BaseModel):
    """Schema cho response ServiceFee"""
    model_config = ConfigDict(from_attributes=True)

    serviceID: int = Field(..., description="ID phí dịch vụ")
    serviceName: str = Field(..., description="Tên dịch vụ")
    unitPrice: float = Field(..., description="Đơn giá")
    buildingID: str = Field(..., description="Mã tòa nhà")
