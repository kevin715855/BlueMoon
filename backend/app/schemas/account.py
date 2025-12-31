from pydantic import BaseModel, ConfigDict, Field


class AccountBase(BaseModel):
    username: str = Field(..., max_length=50)
    role: str | None = Field(default=None, max_length=20)
    isActive: bool = Field(default=True, description="Trạng thái hoạt động của tài khoản")


class AccountCreate(AccountBase):
    password: str = Field(..., min_length=1, max_length=255)


class AccountUpdate(BaseModel):
    role: str | None = Field(default=None, max_length=20)
    password: str | None = Field(default=None, min_length=1, max_length=255)
    isActive: bool | None = Field(default=None, description="Trạng thái hoạt động")


class AccountRead(AccountBase):
    model_config = ConfigDict(from_attributes=True)

