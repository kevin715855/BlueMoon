from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship

from backend.app.models.base import Base


class ServiceFee(Base):
    __tablename__ = "SERVICE_FEE"

    serviceID = Column(Integer, primary_key=True, autoincrement=True)
    serviceName = Column(String(100))
    unitPrice = Column(DECIMAL(18, 0))
    buildingID = Column(String(10), ForeignKey(
        "BUILDING.buildingID"), index=True)

    # Relationships
    building = relationship("Building", back_populates="service_fees")
