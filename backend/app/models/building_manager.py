from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from backend.app.models.base import Base


class BuildingManager(Base):
    __tablename__ = "BUILDING_MANAGER"

    managerID = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    phoneNumber = Column(String(15))
    username = Column(String(50), ForeignKey("ACCOUNT.username"), unique=True)

    # Relationships
    account = relationship("Account", backref="building_manager")
    buildings = relationship("Building", back_populates="manager")
