from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from backend.app.models.base import Base


class Building(Base):
    __tablename__ = "BUILDING"

    buildingID = Column(String(10), primary_key=True)
    managerID = Column(Integer, ForeignKey(
        "BUILDING_MANAGER.managerID"), index=True)
    address = Column(String(200))
    numApartment = Column(Integer)

    # Relationships
    manager = relationship("BuildingManager", back_populates="buildings")
    apartments = relationship("Apartment", back_populates="building")
    service_fees = relationship("ServiceFee", back_populates="building")
