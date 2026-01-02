from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class MeterReadingBase(BaseModel):
    apartmentID: str
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000)
    oldElectricity: float = 0
    newElectricity: float = 0
    oldWater: float = 0
    newWater: float = 0

class MeterReadingCreate(MeterReadingBase):
    pass

class MeterReadingUpdate(BaseModel):
    newElectricity: Optional[float] = None
    newWater: Optional[float] = None

class MeterReadingRead(MeterReadingBase):
    model_config = ConfigDict(from_attributes=True)
    readingID: int
    recordedDate: datetime
    electricity_consumption: float
    water_consumption: float