from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from backend.app.models.base import Base

class Accountant(Base):
    __tablename__ = "ACCOUNTANT"

    accountantID = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), ForeignKey("ACCOUNT.username"), unique=True)
    
    fullname = Column(String(100), nullable=True)
    phoneNumber = Column(String(20), nullable=True)

    # Relationships
    account = relationship("Account", backref="accountant")
    bills = relationship("Bill", back_populates="accountant")