from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from backend.app.models.base import Base


class Apartment(Base):
    __tablename__ = "APARTMENT"

    apartmentID = Column(String(10), primary_key=True)
    buildingID = Column(String(10), ForeignKey(
        "BUILDING.buildingID"), index=True)
    numResident = Column(Integer, default=0)

    # Relationships
    building = relationship("Building", back_populates="apartments")
    residents = relationship("Resident", back_populates="apartment")
    bills = relationship("Bill", back_populates="apartment")
