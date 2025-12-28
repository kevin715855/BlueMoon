from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Bill(Base):
    pass