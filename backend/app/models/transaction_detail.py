from sqlalchemy import Column, Integer, DECIMAL, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from backend.app.models.base import Base


class TransactionDetail(Base):
    __tablename__ = "TRANSACTION_DETAIL"
    __table_args__ = (
        UniqueConstraint("transID", "billID", name="UQ_TXDETAIL_TRANS_BILL"),
    )

    detailID = Column(Integer, primary_key=True, autoincrement=True)
    transID = Column(Integer, ForeignKey(
        "PAYMENT_TRANSACTION.transID"), nullable=False, index=True)
    billID = Column(Integer, ForeignKey("BILL.billID"),
                    nullable=False, index=True)
    amount = Column(DECIMAL(18, 0))

    # Relationships
    transaction = relationship(
        "PaymentTransaction", back_populates="transaction_details")
    bill = relationship("Bill", back_populates="transaction_details")
