import datetime as dt

from pydantic import BaseModel, ConfigDict, Field


class ResidentBase(BaseModel):
    apartmentID: str | None = Field(default=None, max_length=10)
    fullName: str = Field(..., max_length=100)
    age: int | None = None
    date: dt.date | None = None
    phoneNumber: str | None = Field(default=None, max_length=15)
    isOwner: bool = False
    username: str | None = Field(default=None, max_length=50)


class ResidentCreate(ResidentBase):
    pass


class ResidentUpdate(BaseModel):
    apartmentID: str | None = Field(default=None, max_length=10)
    fullName: str | None = Field(default=None, max_length=100)
    age: int | None = None
    date: dt.date | None = None
    phoneNumber: str | None = Field(default=None, max_length=15)
    isOwner: bool | None = None
    username: str | None = Field(default=None, max_length=50)


class ResidentRead(ResidentBase):
    model_config = ConfigDict(from_attributes=True)

    residentID: int
