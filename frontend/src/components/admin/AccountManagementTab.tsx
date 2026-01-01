import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ShieldAlert, UserPlus, Check, Lock, User, Mail } from "lucide-react";
import { api, type AccountCreate } from "../../services/api";
import { Permissions, type UserRole } from "../../utils/permissions";
import { toast } from "sonner";

interface AccountManagementTabProps {
  role: string;
}

export function AccountManagementTab({ role }: AccountManagementTabProps) {
  const [loading, setLoading] = useState(false);
  const [createForm, setCreateForm] = useState<AccountCreate>({
    username: "",
    password: "",
    role: "Resident",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const canAccess = Permissions.canManageAccounts(role as UserRole);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password confirmation
    if (createForm.password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    // Validate password strength
    if (createForm.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      await api.accounts.create(createForm);
      toast.success("Tạo tài khoản thành công!");
      // Reset form
      setCreateForm({ username: "", password: "", role: "Resident" });
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo tài khoản");
    } finally {
      setLoading(false);
    }
  };

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="shadow-lg max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-xl text-gray-900 mb-2">Không có quyền truy cập</h3>
            <p className="text-gray-600 text-center">
              Chỉ Manager và Admin mới có quyền quản lý tài khoản
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[600px] py-8">
      <Card className="w-full max-w-xl shadow-2xl border-blue-200">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg text-center pb-8">
          <CardTitle className="text-3xl text-white mb-2">Tạo tài khoản mới</CardTitle>
          <CardDescription className="text-blue-100">
            Nhập thông tin để tạo tài khoản người dùng trong hệ thống BlueMoon
          </CardDescription>
        </CardHeader>

        {/* Form */}
        <CardContent className="pt-8 pb-8 px-8">
          <form onSubmit={handleCreateAccount} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700">
                Tên đăng nhập <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  required
                  minLength={3}
                />
              </div>
              <p className="text-xs text-gray-500">Tên đăng nhập phải có ít nhất 3 ký tự</p>
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700">
                Vai trò <span className="text-red-500">*</span>
              </Label>
              <Select
                value={createForm.role}
                onValueChange={(value) => setCreateForm({ ...createForm, role: value as UserRole })}
              >
                <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Resident">
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>Cư dân</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Accountant">
                    <div className="flex items-center gap-2">
                      <span>🧮</span>
                      <span>Kế toán</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Manager">
                    <div className="flex items-center gap-2">
                      <span>📋</span>
                      <span>Quản lý</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Admin">
                    <div className="flex items-center gap-2">
                      <span>👑</span>
                      <span>Quản trị viên</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {confirmPassword && (
                <div className="flex items-center gap-2 text-xs">
                  {createForm.password === confirmPassword ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Mật khẩu khớp
                    </span>
                  ) : (
                    <span className="text-red-600">Mật khẩu không khớp</span>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang tạo tài khoản...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  <span>Tạo tài khoản</span>
                </div>
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">📌 Lưu ý:</h4>
            <ul className="space-y-1 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Tên đăng nhập phải là duy nhất trong hệ thống</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Mật khẩu nên kết hợp chữ hoa, chữ thường và số để bảo mật tốt hơn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Người dùng sẽ sử dụng thông tin này để đăng nhập vào hệ thống</span>
              </li>
            </ul>
          </div>

          {/* Role Descriptions */}
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Mô tả vai trò:</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">👤</span>
                <div>
                  <p className="font-medium text-sm text-gray-900">Cư dân</p>
                  <p className="text-xs text-gray-600">Xem hóa đơn, thanh toán trực tuyến</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">🧮</span>
                <div>
                  <p className="font-medium text-sm text-gray-900">Kế toán</p>
                  <p className="text-xs text-gray-600">Quản lý hóa đơn, thanh toán offline</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">📋</span>
                <div>
                  <p className="font-medium text-sm text-gray-900">Quản lý</p>
                  <p className="text-xs text-gray-600">Quản lý cư dân, căn hộ, tòa nhà</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">👑</span>
                <div>
                  <p className="font-medium text-sm text-gray-900">Quản trị viên</p>
                  <p className="text-xs text-gray-600">Toàn quyền quản lý hệ thống</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
