import datetime as dt
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, DECIMAL
from backend.app.models.base import Base

class Notification(Base):
    __tablename__ = "NOTIFICATION"

    notificationID = Column(Integer, primary_key=True, index=True)
    residentID = Column(Integer, ForeignKey("RESIDENT.residentID"), nullable=False)
    
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    
    # Các type: 'METER_READING', 'NEW_BILL', 'PAYMENT_RESULT', 'GENERAL'
    type = Column(String(50), nullable=False) 
    
    relatedID = Column(Integer, nullable=True) # ID hóa đơn hoặc ID giao dịch
    isRead = Column(Boolean, default=False)    # Trạng thái đã xem
    
    createdDate = Column(DateTime, default=dt.datetime.now)

    # Chỉ số điện nước
    electricity = Column(DECIMAL(10, 2), nullable=True)
    water = Column(DECIMAL(10, 2), nullable=True)