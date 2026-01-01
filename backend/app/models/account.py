from sqlalchemy import Column, String, Boolean

from backend.app.models.base import Base


class Account(Base):
    __tablename__ = "ACCOUNT"

    username = Column(String(50), primary_key=True)
    password = Column(String(255), nullable=False)
    role = Column(String(20))
    isActive = Column(Boolean, default=True, nullable=False)
