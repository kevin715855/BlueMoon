import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Bell, BellOff, Check, CheckCheck, Zap, Droplet, RefreshCw } from "lucide-react";
import { api, type Notification } from "../../services/api";
import { toast } from "sonner";
import { LoadingSpinner } from "../shared/LoadingSpinner";

export function ResidentNotificationTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.notifications.getMyNotifications(0, 100);
      setNotifications(data);

      // Get unread count
      const countData = await api.notifications.getUnreadCount();
      setUnreadCount(countData.count);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.notifications.markAsRead(id);

      // Update local state
      setNotifications(notifications.map(n =>
        n.notificationID === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));

      toast.success("Đã đánh dấu là đã đọc");
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật thông báo");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);

      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map(n => api.notifications.markAsRead(n.notificationID))
      );

      // Update local state
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);

      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật thông báo");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? "Vừa xong" : `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInHours < 48) {
      return "Hôm qua";
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.electricity !== null && notification.electricity !== undefined) {
      return <Zap className="w-5 h-5 text-yellow-500" />;
    }
    if (notification.water !== null && notification.water !== undefined) {
      return <Droplet className="w-5 h-5 text-blue-500" />;
    }
    return <Bell className="w-5 h-5 text-blue-600" />;
  };

  const filteredNotifications = filter === "unread"
    ? notifications.filter(n => !n.isRead)
    : notifications;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Thông báo</h1>
          <p className="text-gray-600">
            Theo dõi thông báo quan trọng từ ban quản lý
          </p>
        </div>
        <Button
          onClick={fetchNotifications}
          variant="outline"
          className="gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </Button>
      </div>

      {/* Stats and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-lg border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng thông báo</p>
                <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Chưa đọc</p>
                <p className="text-3xl font-bold text-orange-600">{unreadCount}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <BellOff className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Đã đọc</p>
                <p className="text-3xl font-bold text-green-600">
                  {notifications.length - unreadCount}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CheckCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Actions */}
      <Card className="shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter("all")}
                variant={filter === "all" ? "default" : "outline"}
                className={`${filter === "all" ? "bg-blue-600 hover:bg-blue-700" : ""} cursor-pointer`}
              >
                Tất cả ({notifications.length})
              </Button>
              <Button
                onClick={() => setFilter("unread")}
                variant={filter === "unread" ? "default" : "outline"}
                className={`${filter === "unread" ? "bg-orange-600 hover:bg-orange-700" : ""} cursor-pointer`}
              >
                Chưa đọc ({unreadCount})
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                className="gap-2 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                Đánh dấu tất cả là đã đọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <Bell className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-gray-900 mb-2">Không có thông báo</h3>
              <p className="text-gray-600 text-center">
                {filter === "unread"
                  ? "Bạn đã đọc tất cả thông báo"
                  : "Hiện tại chưa có thông báo nào"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.notificationID}
              className={`shadow-lg transition-all hover:shadow-xl ${
                notification.isRead
                  ? "bg-white border-gray-200"
                  : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      notification.isRead ? "bg-gray-100" : "bg-white shadow-md"
                    }`}
                  >
                    {getNotificationIcon(notification)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3
                        className={`${
                          notification.isRead ? "text-gray-900" : "text-blue-900 font-semibold"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <Badge className="bg-orange-500 hover:bg-orange-600">Mới</Badge>
                      )}
                    </div>

                    <p className="text-gray-700 mb-3 whitespace-pre-line">
                      {notification.content}
                    </p>

                    {/* Meter Reading Info */}
                    {(notification.electricity !== null || notification.water !== null) && (
                      <div className="flex gap-4 mb-3">
                        {notification.electricity !== null &&
                          notification.electricity !== undefined && (
                            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                              <Zap className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm text-yellow-900">
                                Điện: <strong>{notification.electricity} kWh</strong>
                              </span>
                            </div>
                          )}
                        {notification.water !== null && notification.water !== undefined && (
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                            <Droplet className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-900">
                              Nước: <strong>{notification.water} m³</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatDate(notification.createdDate)}
                      </span>

                      {!notification.isRead && (
                        <Button
                          onClick={() => handleMarkAsRead(notification.notificationID)}
                          size="sm"
                          variant="outline"
                          className="gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Đánh dấu là đã đọc
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
