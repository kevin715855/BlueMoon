import datetime as dt
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class PaymentStatus(str, Enum):
    Pending = "Pending"
    Success = "Success"
    Failed = "Failed"


class PaymentTransactionBase(BaseModel):
    residentID: int
    amount: int
    paymentContent: str | None = Field(default=None, max_length=50)
    paymentMethod: str | None = Field(default=None, max_length=20)
    status: PaymentStatus = PaymentStatus.Pending
    createdDate: dt.datetime | None = None
    payDate: dt.datetime | None = None
    gatewayTransCode: str | None = Field(default=None, max_length=100)


class PaymentTransactionCreate(BaseModel):
    residentID: int
    amount: int
    paymentContent: str | None = Field(default=None, max_length=50)
    paymentMethod: str | None = Field(default=None, max_length=20)


class PaymentTransactionUpdate(BaseModel):
    status: PaymentStatus | None = None
    payDate: dt.datetime | None = None
    gatewayTransCode: str | None = Field(default=None, max_length=100)


class PaymentTransactionRead(PaymentTransactionBase):
    model_config = ConfigDict(from_attributes=True)

    transID: int


class TransactionDetailBase(BaseModel):
    transID: int
    billID: int
    amount: int | None = None


class TransactionDetailCreate(TransactionDetailBase):
    pass


class TransactionDetailUpdate(BaseModel):
    amount: int | None = None


class TransactionDetailRead(TransactionDetailBase):
    model_config = ConfigDict(from_attributes=True)

    detailID: int
