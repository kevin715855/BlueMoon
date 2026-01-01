import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ShieldAlert } from "lucide-react";
import { Permissions, type UserRole } from "../../utils/permissions";

interface OfflinePaymentsTabProps {
  role: string;
}

export function OfflinePaymentsTab({ role }: OfflinePaymentsTabProps) {
  const canAccess = Permissions.canManageOfflinePayments(role as UserRole);

  if (!canAccess) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-gray-900 mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600 text-center">
            Chỉ Accountant và Admin mới có quyền xử lý thanh toán ngoại tuyến
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-white">Thanh toán ngoại tuyến</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          Chức năng xử lý thanh toán ngoại tuyến cho cư dân.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Tính năng đang được phát triển...
        </p>
      </CardContent>
    </Card>
  );
}
