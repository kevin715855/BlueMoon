from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.db import get_db
from backend.app.models.notification import Notification
from backend.app.models.resident import Resident
# Lưu ý: Cần đảm bảo NotificationRead trong schemas có thêm trường electricity, water
from backend.app.schemas.notification import NotificationRead, BroadcastRequest
from backend.app.services.notification_service import NotificationService 
from backend.app.api.auth import get_current_user, get_current_manager
router = APIRouter()

@router.get("/my-notification", response_model=List[NotificationRead])
def get_my_notifications(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Lấy danh sách thông báo của người dùng đang đăng nhập.
    """
    resident = db.query(Resident).filter(Resident.username == current_user.username).first()
    if not resident:
        return []

    return db.query(Notification)\
        .filter(Notification.residentID == resident.residentID)\
        .order_by(Notification.createdDate.desc())\
        .offset(skip).limit(limit).all()

@router.put("/{id}/read")
def mark_as_read(
    id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Đánh dấu một thông báo là 'Đã đọc'"""
    
    resident = db.query(Resident).filter(Resident.username == current_user.username).first()
    if not resident:
        raise HTTPException(401, "Không xác định được cư dân")

    noti = db.query(Notification).filter(Notification.notificationID == id).first()
    if not noti: 
        raise HTTPException(404, "Không tìm thấy thông báo")
    
    if noti.residentID != resident.residentID:
        raise HTTPException(403, "Bạn không có quyền thao tác trên thông báo này")
    
    noti.isRead = True
    db.commit()
    return {"message": "Đã đánh dấu đã đọc"}

@router.get("/unread-count")
def count_unread(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Đếm số lượng thông báo chưa đọc (Dùng để hiển thị chấm đỏ trên icon chuông)"""
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
    """
    Gửi thông báo chung cho toàn bộ cư dân (Ví dụ: Cắt nước, Họp tổ dân phố).
    """
    count = NotificationService.create_broadcast(db, payload.title, payload.content)
    
    return {"message": f"Đã gửi thông báo thành công đến {count} cư dân"}
