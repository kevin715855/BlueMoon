from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from backend.app.models.base import Base


class Resident(Base):
    __tablename__ = "RESIDENT"

    residentID = Column(Integer, primary_key=True, autoincrement=True)
    apartmentID = Column(String(10), ForeignKey(
        "APARTMENT.apartmentID"), index=True)
    fullName = Column(String(100), nullable=False)
    age = Column(Integer)
    date = Column(Date)
    phoneNumber = Column(String(15))
    isOwner = Column(Boolean, default=False)
    username = Column(String(50), ForeignKey("ACCOUNT.username"), unique=True)

    # Relationships
    apartment = relationship("Apartment", back_populates="residents")
    account = relationship("Account", backref="resident")
    payment_transactions = relationship(
        "PaymentTransaction", back_populates="resident")
