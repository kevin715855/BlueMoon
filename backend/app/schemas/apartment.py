from pydantic import BaseModel, ConfigDict, Field


class ApartmentBase(BaseModel):
    apartmentID: str = Field(..., max_length=10)
    buildingID: str | None = Field(default=None, max_length=10)
    numResident: int = 0


class ApartmentCreate(ApartmentBase):
    pass


class ApartmentUpdate(BaseModel):
    buildingID: str | None = Field(default=None, max_length=10)
    numResident: int | None = None


class ApartmentRead(ApartmentBase):
    model_config = ConfigDict(from_attributes=True)
