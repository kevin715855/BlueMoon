import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, Building, FileText, UserCog } from "lucide-react";

export function AdminOverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-blue-50">
            <CardTitle className="text-sm text-blue-900">Tổng cư dân</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">-</div>
            <p className="text-xs text-gray-500 mt-1">Đang cập nhật</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-blue-50">
            <CardTitle className="text-sm text-blue-900">Tổng căn hộ</CardTitle>
            <Building className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">-</div>
            <p className="text-xs text-gray-500 mt-1">Đang cập nhật</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-blue-50">
            <CardTitle className="text-sm text-blue-900">Hóa đơn chưa thanh toán</CardTitle>
            <FileText className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">-</div>
            <p className="text-xs text-gray-500 mt-1">Đang cập nhật</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-blue-50">
            <CardTitle className="text-sm text-blue-900">Tài khoản quản trị</CardTitle>
            <UserCog className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">-</div>
            <p className="text-xs text-gray-500 mt-1">Đang cập nhật</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-white">Chào mừng đến với hệ thống BlueMoon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Sử dụng menu bên trái để quản lý các chức năng của hệ thống.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}