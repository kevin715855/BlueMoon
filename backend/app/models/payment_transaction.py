from sqlalchemy import Column, Integer, String, DateTime, DECIMAL, Enum, ForeignKey
from sqlalchemy.orm import relationship

from backend.app.models.base import Base


class PaymentTransaction(Base):
    __tablename__ = "PAYMENT_TRANSACTION"

    transID = Column(Integer, primary_key=True, autoincrement=True)
    residentID = Column(Integer, ForeignKey(
        "RESIDENT.residentID"), nullable=False, index=True)
    amount = Column(DECIMAL(18, 0), nullable=False)
    paymentContent = Column(String(50))
    paymentMethod = Column(String(20))
    status = Column(Enum("Pending", "Success", "Failed",
                    name="payment_status"), default="Pending", index=True)
    createdDate = Column(DateTime, index=True)
    payDate = Column(DateTime)
    gatewayTransCode = Column(String(100))

    # Relationships
    resident = relationship("Resident", back_populates="payment_transactions")
    transaction_details = relationship(
        "TransactionDetail", back_populates="transaction")
