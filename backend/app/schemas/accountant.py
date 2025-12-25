from pydantic import BaseModel, ConfigDict, Field


class AccountantBase(BaseModel):
    username: str | None = Field(default=None, max_length=50)


class AccountantCreate(AccountantBase):
    pass


class AccountantUpdate(BaseModel):
    username: str | None = Field(default=None, max_length=50)


class AccountantRead(AccountantBase):
    model_config = ConfigDict(from_attributes=True)

    accountantID: int
