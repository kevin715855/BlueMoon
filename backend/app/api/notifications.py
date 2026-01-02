from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.db import get_db
from backend.app.models.notification import Notification
from backend.app.models.resident import Resident
from backend.app.schemas.notification import NotificationRead, BroadcastRequest, MeterNotificationList
from backend.app.services.notification_service import NotificationService 
from backend.app.api.auth import get_current_user, get_only_admin, get_current_manager

router = APIRouter()

@router.get("/my-notification", response_model=List[NotificationRead])
def get_my_notifications(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    API xem danh sách
    """
    resident = db.query(Resident).filter(Resident.username == current_user.username).first()
    if not resident:
        return []

    return db.query(Notification)\
        .filter(Notification.residentID == resident.residentID)\
        .order_by(Notification.createdDate.desc())\
        .offset(skip).limit(limit).all()

@router.put("/{id}/read")
def mark_as_read(id: int, db: Session = Depends(get_db)):
    """Đánh dấu đã đọc"""
    noti = db.query(Notification).filter(Notification.notificationID == id).first()
    if not noti: 
        raise HTTPException(404, "Không tìm thấy thông báo")
    
    noti.isRead = True
    db.commit()
    return {"message": "Đã xem"}

@router.get("/unread-count")
def count_unread(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Đếm số chưa đọc"""
    resident = db.query(Resident).filter(Resident.username == current_user.username).first()
    if not resident: 
        return {"count": 0}
    
    count = db.query(Notification).filter(
        Notification.residentID == resident.residentID, 
        Notification.isRead == False 
    ).count()
    return {"count": count}

@router.post("/broadcast", status_code=status.HTTP_201_CREATED)
def broadcast_notification(
    payload: BroadcastRequest,
    db: Session = Depends(get_db),
    manager = Depends(get_current_manager)
):
    """Manager gửi thông báo chung"""
    count = NotificationService.create_broadcast(db, payload.title, payload.content)
    
    return {"message": f"Đã gửi thông báo đến {count} cư dân"}

@router.post("/send-monthly-readings", status_code=status.HTTP_201_CREATED)
def send_monthly_readings(
    payload: MeterNotificationList, # Nhận cục JSON to đùng từ Frontend
    db: Session = Depends(get_db),
    manager = Depends(get_current_manager)
):
    """
    API để Admin đẩy số điện nước của nhiều hộ dân lên cùng lúc.
    Frontend sẽ gửi dạng:
    {
        "month": 12,
        "year": 2025,
        "readings": [
            {"residentID": 1, "electricity": 100, "water": 10},
            {"residentID": 2, "electricity": 150, "water": 12}
        ]
    }
    """
    count = NotificationService.send_meter_notifications(
        db=db, 
        month=payload.month, 
        year=payload.year, 
        readings_data=payload.readings
    )
    
    return {"message": f"Đã gửi thông báo chỉ số điện nước cho {count} cư dân."}