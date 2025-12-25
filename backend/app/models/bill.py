from sqlalchemy import Column, Integer, String, DateTime, Date, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship

from backend.app.models.base import Base


class Bill(Base):
    __tablename__ = "BILL"

    billID = Column(Integer, primary_key=True, autoincrement=True)
    apartmentID = Column(String(10), ForeignKey(
        "APARTMENT.apartmentID"), index=True)
    accountantID = Column(Integer, ForeignKey(
        "ACCOUNTANT.accountantID"), index=True)
    createDate = Column(DateTime)
    deadline = Column(Date, index=True)
    typeOfBill = Column(String(50))
    amount = Column(DECIMAL(18, 0))
    total = Column(DECIMAL(18, 0))
    status = Column(String(20), index=True)
    paymentMethod = Column(String(50))

    # Relationships
    apartment = relationship("Apartment", back_populates="bills")
    accountant = relationship("Accountant", back_populates="bills")
    transaction_details = relationship(
        "TransactionDetail", back_populates="bill")
