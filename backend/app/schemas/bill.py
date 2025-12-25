import datetime as dt

from pydantic import BaseModel, ConfigDict, Field


class BillBase(BaseModel):
    apartmentID: str | None = Field(default=None, max_length=10)
    accountantID: int | None = None
    createDate: dt.datetime | None = None
    deadline: dt.date | None = None
    typeOfBill: str | None = Field(default=None, max_length=50)
    amount: int | None = None
    total: int | None = None
    status: str | None = Field(default=None, max_length=20)
    paymentMethod: str | None = Field(default=None, max_length=50)


class BillCreate(BaseModel):
    apartmentID: str = Field(..., max_length=10)
    accountantID: int | None = None
    deadline: dt.date | None = None
    typeOfBill: str | None = Field(default=None, max_length=50)
    amount: int | None = None
    total: int | None = None
    status: str | None = Field(default=None, max_length=20)
    paymentMethod: str | None = Field(default=None, max_length=50)


class BillUpdate(BaseModel):
    deadline: dt.date | None = None
    typeOfBill: str | None = Field(default=None, max_length=50)
    amount: int | None = None
    total: int | None = None
    status: str | None = Field(default=None, max_length=20)
    paymentMethod: str | None = Field(default=None, max_length=50)


class BillRead(BillBase):
    model_config = ConfigDict(from_attributes=True)

    billID: int
