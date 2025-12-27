"""
Pydantic schemas cho Bill
"""
import datetime as dt
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Literal


class BillBase(BaseModel):
    """Base schema cho Bill"""
    apartmentID: str | None = Field(
        default=None, max_length=10, description="Mã căn hộ")
    accountantID: int | None = Field(
        default=None, description="ID kế toán tạo bill")
    createDate: dt.datetime | None = Field(
        default=None, description="Ngày tạo (auto)")
    deadline: dt.date | None = Field(
        default=None, description="Hạn thanh toán")
    typeOfBill: str | None = Field(
        default=None, max_length=50, description="Loại hóa đơn")
    amount: float | None = Field(default=None, ge=0, description="Số tiền gốc")
    total: float | None = Field(
        default=None, ge=0, description="Tổng tiền (sau thuế/phí)")
    status: Literal["Unpaid", "Paid", "Overdue"] | None = Field(
        default="Unpaid", description="Trạng thái")
    paymentMethod: str | None = Field(
        default=None, max_length=50, description="Phương thức thanh toán")


class BillCreate(BaseModel):
    """Schema cho tạo Bill mới"""
    apartmentID: str = Field(..., max_length=10,
                             description="Mã căn hộ (bắt buộc)")
    accountantID: int = Field(..., description="ID kế toán (bắt buộc)")
    deadline: dt.date = Field(..., description="Hạn thanh toán (bắt buộc)")
    typeOfBill: str = Field(..., max_length=50, description="Loại hóa đơn")
    amount: float = Field(..., gt=0, description="Số tiền gốc phải > 0")
    total: float = Field(..., gt=0, description="Tổng tiền phải > 0")

    @field_validator('deadline')
    @classmethod
    def validate_deadline(cls, v):
        if v < dt.date.today():
            raise ValueError('Deadline không thể là ngày quá khứ')
        return v

    @field_validator('total')
    @classmethod
    def validate_total(cls, v, info):
        # Total phải >= amount
        amount = info.data.get('amount')
        if amount and v < amount:
            raise ValueError('Total phải >= amount')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "apartmentID": "A101",
                "accountantID": 1,
                "deadline": "2025-02-01",
                "typeOfBill": "Phí quản lý",
                "amount": 500000,
                "total": 550000
            }
        }


class BillUpdate(BaseModel):
    """Schema cho cập nhật Bill"""
    deadline: dt.date | None = None
    typeOfBill: str | None = Field(default=None, max_length=50)
    amount: float | None = Field(default=None, ge=0)
    total: float | None = Field(default=None, ge=0)
    status: Literal["Unpaid", "Paid", "Overdue"] | None = None
    paymentMethod: str | None = Field(default=None, max_length=50)


class BillRead(BillBase):
    """Schema cho response Bill"""
    model_config = ConfigDict(from_attributes=True)

    billID: int = Field(..., description="ID hóa đơn")


class BillQueryParams(BaseModel):
    """
    Query parameters cho filter bills
    Dùng với stored procedure sp_get_bills_by_apartment
    """
    apartmentID: str | None = Field(
        default=None, max_length=10, description="Lọc theo căn hộ")
    status: Literal["Unpaid", "Paid", "Overdue"] | None = Field(
        default=None, description="Lọc theo trạng thái")

    class Config:
        json_schema_extra = {
            "example": {
                "apartmentID": "A101",
                "status": "Unpaid"
            }
        }


class BillListResponse(BaseModel):
    """Response cho list bills"""
    bills: list[BillRead] = Field(..., description="Danh sách hóa đơn")
    total: int = Field(..., description="Tổng số hóa đơn")
    unpaidCount: int | None = Field(
        default=None, description="Số hóa đơn chưa thanh toán")
    totalUnpaidAmount: float | None = Field(
        default=None, description="Tổng tiền chưa thanh toán")
