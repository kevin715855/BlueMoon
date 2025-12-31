"""
Pydantic schemas cho Apartment
"""
from pydantic import BaseModel, ConfigDict, Field


class ApartmentBase(BaseModel):
    """Base cho Apartment"""
    apartmentID: str = Field(..., max_length=10,
                             description="Mã căn hộ (VD: A101, B205)")
    buildingID: str | None = Field(
        default=None, max_length=10, description="Mã tòa nhà")
    numResident: int = Field(default=0, ge=0, description="Số lượng cư dân")




class ApartmentUpdate(BaseModel):
    """Schema cho cập nhật Apartment"""
    buildingID: str | None = Field(default=None, max_length=10)
    numResident: int | None = Field(default=None, ge=0)


class ApartmentRead(ApartmentBase):
    """Schema cho response Apartment"""
    model_config = ConfigDict(from_attributes=True)
