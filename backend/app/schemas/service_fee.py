from pydantic import BaseModel, ConfigDict, Field


class ServiceFeeBase(BaseModel):
    serviceName: str | None = Field(default=None, max_length=100)
    unitPrice: int | None = None
    buildingID: str | None = Field(default=None, max_length=10)


class ServiceFeeCreate(ServiceFeeBase):
    pass


class ServiceFeeUpdate(BaseModel):
    serviceName: str | None = Field(default=None, max_length=100)
    unitPrice: int | None = None
    buildingID: str | None = Field(default=None, max_length=10)


class ServiceFeeRead(ServiceFeeBase):
    model_config = ConfigDict(from_attributes=True)

    serviceID: int
