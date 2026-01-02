from sqlalchemy import Column, Integer, String, DateTime, DECIMAL, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
import datetime as dt
from backend.app.models.base import Base

class MeterReading(Base):
    __tablename__ = "METER_READING"

    readingID = Column(Integer, primary_key=True, autoincrement=True)
    apartmentID = Column(String(10), ForeignKey("APARTMENT.apartmentID"), nullable=False, index=True)
    
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    
    oldElectricity = Column(DECIMAL(10, 2), default=0)
    newElectricity = Column(DECIMAL(10, 2), default=0)
    
    oldWater = Column(DECIMAL(10, 2), default=0)
    newWater = Column(DECIMAL(10, 2), default=0)
    
    recordedDate = Column(DateTime, default=dt.datetime.now)
    accountantID = Column(Integer, ForeignKey("ACCOUNTANT.accountantID"))

    # Ràng buộc: Mỗi căn hộ chỉ có 1 bản ghi chỉ số mỗi tháng
    __table_args__ = (
        UniqueConstraint('apartmentID', 'month', 'year', name='_apartment_month_year_uc'),
    )

    # Relationships
    apartment = relationship("Apartment", backref="meter_readings")
    accountant = relationship("Accountant", backref="recorded_readings")

    @property
    def electricity_consumption(self):
        return max(0, self.newElectricity - self.oldElectricity)

    @property
    def water_consumption(self):
        return max(0, self.newWater - self.oldWater)