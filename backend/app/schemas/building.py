from pydantic import BaseModel, ConfigDict, Field


class BuildingManagerBase(BaseModel):
    name: str = Field(..., max_length=100)
    phoneNumber: str | None = Field(default=None, max_length=15)
    username: str | None = Field(default=None, max_length=50)


class BuildingManagerCreate(BuildingManagerBase):
    pass


class BuildingManagerUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    phoneNumber: str | None = Field(default=None, max_length=15)
    username: str | None = Field(default=None, max_length=50)


class BuildingManagerRead(BuildingManagerBase):
    model_config = ConfigDict(from_attributes=True)

    managerID: int


class BuildingBase(BaseModel):
    buildingID: str = Field(..., max_length=10)
    managerID: int | None = None
    address: str | None = Field(default=None, max_length=200)
    numApartment: int | None = None


class BuildingCreate(BuildingBase):
    pass


class BuildingUpdate(BaseModel):
    managerID: int | None = None
    address: str | None = Field(default=None, max_length=200)
    numApartment: int | None = None


class BuildingRead(BuildingBase):
    model_config = ConfigDict(from_attributes=True)
