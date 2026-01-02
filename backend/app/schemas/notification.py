from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Schema cơ bản
class NotificationBase(BaseModel):
    type: str
    title: str
    content: Optional[str] = None
    electricity: Optional[float] = None
    water: Optional[float] = None
    relatedID: Optional[int] = None
    isRead: bool = False

# Schema dùng để Manager gửi thông báo chung
class BroadcastRequest(BaseModel):
    title: str
    content: str

# Schema trả về cho Frontend
class NotificationRead(NotificationBase):
    notificationID: int
    createdDate: datetime

    class Config:
        from_attributes = True