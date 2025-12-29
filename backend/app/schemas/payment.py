"""
Pydantic schemas cho Payment Transaction và Transaction Detail
"""
import datetime as dt
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class PaymentStatus(str, Enum):
    """Enum cho trạng thái thanh toán"""
    Pending = "Pending"
    Success = "Success"
    Failed = "Failed"

class PaymentCreateRequest(BaseModel):
    """
    Chỉ cần gửi danh sách ID hóa đơn.
    Backend tự tính tiền để bảo mật.
    """
    bill_ids: List[int] = Field(..., description="Danh sách ID hóa đơn cần thanh toán", min_length=1)

    class Config:
        json_schema_extra = {
            "example": {
                "bill_ids": [10]
            }
        }

# ==================== PAYMENT TRANSACTION ====================

class PaymentTransactionBase(BaseModel):
    """Base schema cho Payment Transaction"""
    residentID: int = Field(..., description="ID cư dân thanh toán")
    amount: float = Field(..., gt=0, description="Tổng số tiền thanh toán")
    paymentContent: str | None = Field(
        default=None, max_length=50, description="Nội dung thanh toán")
    paymentMethod: str | None = Field(
        default=None, max_length=20, description="Phương thức (VNPay, MoMo, etc)")
    status: PaymentStatus = Field(
        default=PaymentStatus.Pending, description="Trạng thái")
    createdDate: dt.datetime | None = Field(
        default=None, description="Ngày tạo (auto)")
    payDate: dt.datetime | None = Field(
        default=None, description="Ngày thanh toán thành công")
    gatewayTransCode: str | None = Field(
        default=None, max_length=100, description="Mã giao dịch từ gateway")


class PaymentTransactionCreate(BaseModel):
    """Schema cho tạo Payment Transaction (dùng sp_create_payment_transaction)"""
    residentID: int = Field(..., description="ID cư dân")
    amount: float = Field(..., gt=0, description="Số tiền phải > 0")
    paymentContent: str = Field(..., max_length=50,
                                description="Nội dung thanh toán")
    paymentMethod: str = Field(..., max_length=20,
                               description="Phương thức thanh toán")
    gatewayTransCode: str | None = Field(
        default=None, max_length=100, description="Mã từ gateway")

    class Config:
        json_schema_extra = {
            "example": {
                "residentID": 1,
                "amount": 1500000,
                "paymentContent": "Thanh toán hóa đơn tháng 1",
                "paymentMethod": "VNPay",
                "gatewayTransCode": "VNPAY_123456"
            }
        }


class PaymentTransactionUpdate(BaseModel):
    """Schema cho cập nhật Payment Transaction"""
    status: PaymentStatus | None = None
    payDate: dt.datetime | None = None
    gatewayTransCode: str | None = Field(default=None, max_length=100)


class PaymentTransactionRead(PaymentTransactionBase):
    """Schema cho response Payment Transaction"""
    model_config = ConfigDict(from_attributes=True)

    transID: int = Field(..., description="ID giao dịch")


# ==================== TRANSACTION DETAIL ====================

class TransactionDetailBase(BaseModel):
    """Base schema cho Transaction Detail"""
    transID: int = Field(..., description="ID giao dịch")
    billID: int = Field(..., description="ID hóa đơn được thanh toán")
    amount: float | None = Field(
        default=None, ge=0, description="Số tiền thanh toán cho bill này")


class TransactionDetailCreate(TransactionDetailBase):
    """Schema cho tạo Transaction Detail (dùng sp_add_transaction_detail)"""
    amount: float = Field(..., gt=0, description="Số tiền phải > 0")

    class Config:
        json_schema_extra = {
            "example": {
                "transID": 1,
                "billID": 5,
                "amount": 500000
            }
        }


class TransactionDetailRead(TransactionDetailBase):
    """Schema cho response Transaction Detail"""
    model_config = ConfigDict(from_attributes=True)
    detailID: int

# ==================== COMPLEX PAYMENT ====================

class PaymentRequest(BaseModel):
    """Schema cho request thanh toán nhiều bills cùng lúc"""
    residentID: int = Field(..., description="ID cư dân")
    paymentMethod: str = Field(..., max_length=20,
                               description="Phương thức thanh toán")
    paymentContent: str = Field(..., max_length=50,
                                description="Nội dung thanh toán")
    gatewayTransCode: str | None = Field(default=None, max_length=100)
    bills: List["BillPayment"] = Field(..., min_length=1,
                                       description="Danh sách bills cần thanh toán")

    class Config:
        json_schema_extra = {
            "example": {
                "residentID": 1,
                "paymentMethod": "VNPay",
                "paymentContent": "Thanh toán hóa đơn tháng 1",
                "gatewayTransCode": "VNPAY_123456",
                "bills": [
                    {"billID": 5, "amount": 500000},
                    {"billID": 6, "amount": 300000}
                ]
            }
        }


class BillPayment(BaseModel):
    """Schema cho từng bill trong payment request"""
    billID: int = Field(..., description="ID hóa đơn")
    amount: float = Field(..., gt=0,
                          description="Số tiền thanh toán cho bill này")


class PaymentResponse(BaseModel):
    """Schema cho response sau khi thanh toán thành công"""
    transID: int = Field(..., description="ID giao dịch")
    status: str = Field(..., description="Trạng thái")
    totalAmount: float = Field(..., description="Tổng số tiền đã thanh toán")
    billsPaid: int = Field(..., description="Số lượng bills đã thanh toán")

    class Config:
        json_schema_extra = {
            "example": {
                "transID": 1,
                "status": "Success",
                "totalAmount": 800000,
                "billsPaid": 2
            }
        }


class MarkPaymentSuccessRequest(BaseModel):
    """Request để mark transaction thành công (dùng sp_mark_transaction_success)"""
    transID: int = Field(..., description="ID giao dịch cần mark success")


class MarkPaymentSuccessResponse(BaseModel):
    """Response sau khi mark transaction success"""
    transID: int = Field(..., description="ID giao dịch")
    status: str = Field(default="Success", description="Trạng thái mới")
    message: str = Field(..., description="Thông báo kết quả")
    updatedAt: dt.datetime = Field(..., description="Thời gian cập nhật")

    class Config:
        json_schema_extra = {
            "example": {
                "transID": 1,
                "status": "Success",
                "message": "Payment marked as successful. 2 bills updated to Paid.",
                "updatedAt": "2025-12-26T10:30:00"
            }
        }


class TransactionDetailUpdate(BaseModel):
    amount: int | None = None

# ==================== SEPAY WEBHOOK SCHEMAS ====================
class SePayTransactionData(BaseModel):
    id: int
    transaction_date: str
    transaction_content: str
    amount_in: str
    reference_number: Optional[str] = None

class SePayWebhookPayload(BaseModel):
    transaction: SePayTransactionData
