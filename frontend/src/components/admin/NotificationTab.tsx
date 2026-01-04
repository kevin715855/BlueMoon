import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  ShieldAlert,
  Send,
  Bell,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { api, type BroadcastNotification } from "../../services/api";
import { Permissions, type UserRole } from "../../utils/permissions";
import { toast } from "sonner";

interface NotificationTabProps {
  role: string;
}

export function NotificationTab({ role }: NotificationTabProps) {
  const canAccess = Permissions.canBroadcastNotifications(role as UserRole);

  // Broadcast notification state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [notification, setNotification] = useState<BroadcastNotification>({
    title: "",
    content: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastBroadcast, setLastBroadcast] = useState<{
    title: string;
    content: string;
    timestamp: string;
  } | null>(null);

  if (!canAccess) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-gray-900 mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600 text-center">
            Chỉ Manager và Admin mới có quyền gửi thông báo
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleBroadcastSubmit = async () => {
    if (!notification.title.trim() || !notification.content.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }

    setIsProcessing(true);
    try {
      await api.notifications.broadcast(notification);
      toast.success("Đã gửi thông báo tới tất cả cư dân thành công");

      // Save last broadcast info
      setLastBroadcast({
        title: notification.title,
        content: notification.content,
        timestamp: new Date().toISOString(),
      });

      // Reset form
      setNotification({
        title: "",
        content: "",
      });
      setShowBroadcastModal(false);
    } catch (error: any) {
      toast.error(error.message || "Không thể gửi thông báo");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 py-8 max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-gray-900 mb-2">Quản lý thông báo</h1>
        <p className="text-gray-600">
          Gửi thông báo tới tất cả cư dân trong hệ thống
        </p>
      </div>

      {/* Main Broadcast Card */}
      <Card className="shadow-lg border-blue-200 hover:shadow-xl transition-shadow">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-3">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-white">Gửi thông báo</CardTitle>
              <p className="text-blue-100 text-sm mt-1">
                Thông báo sẽ được gửi đến tất cả cư dân
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-blue-50 rounded-full p-6 mb-6">
              <Send className="w-16 h-16 text-blue-600" />
            </div>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Tạo và gửi thông báo quan trọng đến tất cả cư dân trong tòa nhà.
              Thông báo sẽ xuất hiện ngay lập tức trong tab Thông báo của cư
              dân.
            </p>
            <Button
              onClick={() => setShowBroadcastModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer"
              size="lg"
            >
              <Send className="w-5 h-5 mr-2" />
              Tạo thông báo mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Broadcast Info */}
      {lastBroadcast && (
        <Card className="shadow-lg border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <CardTitle className="text-green-900">
                Thông báo gần nhất
              </CardTitle>
              <Badge className="ml-auto bg-green-600">
                {new Date(lastBroadcast.timestamp).toLocaleString("vi-VN")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-gray-700">Tiêu đề</Label>
                <p className="text-gray-900 mt-1">{lastBroadcast.title}</p>
              </div>
              <div>
                <Label className="text-gray-700">Nội dung</Label>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                  {lastBroadcast.content}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="shadow-lg border-yellow-200">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <CardTitle className="text-yellow-900">Lưu ý quan trọng</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">•</span>
              <span>
                Thông báo sẽ được gửi đến <strong>tất cả cư dân</strong> đang
                hoạt động trong hệ thống
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">•</span>
              <span>
                Cư dân sẽ nhận được thông báo ngay lập tức và có thể xem trong
                tab Thông báo
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">•</span>
              <span>
                Vui lòng kiểm tra kỹ nội dung trước khi gửi, không thể thu hồi
                sau khi đã gửi
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">•</span>
              <span>
                Nên sử dụng cho các thông báo quan trọng như: bảo trì, cắt
                điện/nước, sự kiện, quy định mới
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Broadcast Modal */}
      <Dialog open={showBroadcastModal} onOpenChange={setShowBroadcastModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-blue-900 text-2xl">
              Tạo thông báo mới
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Nhập thông tin thông báo gửi đến tất cả cư dân
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            {/* Warning Banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800">
                  <strong>Cảnh báo:</strong> Thông báo này sẽ được gửi đến tất
                  cả cư dân. Vui lòng kiểm tra kỹ trước khi gửi.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <Label htmlFor="title" className="text-gray-700 mb-2 block">
                Tiêu đề *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="VD: Thông báo cắt điện định kỳ"
                value={notification.title}
                onChange={(e) =>
                  setNotification({ ...notification, title: e.target.value })
                }
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {notification.title.length}/100 ký tự
              </p>
            </div>

            <div>
              <Label htmlFor="content" className="text-gray-700 mb-2 block">
                Nội dung *
              </Label>
              <Textarea
                id="content"
                placeholder="Nhập nội dung chi tiết của thông báo..."
                value={notification.content}
                onChange={(e) =>
                  setNotification({ ...notification, content: e.target.value })
                }
                rows={8}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {notification.content.length}/1000 ký tự
              </p>
            </div>

            {/* Preview Section */}
            {(notification.title || notification.content) && (
              <div className="border-t pt-4">
                <Label className="text-gray-700 mb-2 block">Xem trước</Label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                  {notification.title && (
                    <h4 className="text-gray-900">{notification.title}</h4>
                  )}
                  {notification.content && (
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">
                      {notification.content}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    {new Date().toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowBroadcastModal(false)}
                variant="outline"
                className="flex-1 cursor-pointer"
                disabled={isProcessing}
              >
                Hủy
              </Button>
              <Button
                onClick={handleBroadcastSubmit}
                disabled={
                  isProcessing ||
                  !notification.title.trim() ||
                  !notification.content.trim()
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Gửi thông báo
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
