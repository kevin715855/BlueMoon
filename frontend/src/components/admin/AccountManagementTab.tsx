import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { UserPlus, Check, Lock, User, KeyRound } from "lucide-react";
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

  // Password change form state
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const canManageAccounts = Permissions.canManageAccounts(role as UserRole);
  const currentUsername = localStorage.getItem("username") || "";

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password confirmation
    if (newPassword !== confirmNewPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setPasswordChangeLoading(true);
    try {
      await api.accounts.updatePassword(currentUsername, { newPassword });
      toast.success("Đổi mật khẩu thành công!");
      // Reset form
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Không thể đổi mật khẩu");
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Account Creation Section - Only for Admin/Manager */}
        {canManageAccounts && (
          <Card className="shadow-lg border-blue-200 h-fit">
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full p-3">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-white">Tạo tài khoản mới</CardTitle>
                  <CardDescription className="text-blue-100">
                    Nhập thông tin để tạo tài khoản người dùng
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Form */}
            <CardContent className="pt-6 pb-6">
              <form onSubmit={handleCreateAccount} className="space-y-5">
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
                      className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                    <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                      className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                      className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
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
            </CardContent>
          </Card>
        )}

        {/* Password Change Section - Available to ALL users */}
        <Card className="shadow-lg border-blue-200 h-fit">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-3">
                <KeyRound className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-white">Đổi mật khẩu</CardTitle>
                <CardDescription className="text-blue-100">
                  Cập nhật mật khẩu cho tài khoản của bạn
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 pb-6">
            <form onSubmit={handleChangePassword} className="space-y-5">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>

              {/* Confirm New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword" className="text-gray-700">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                {confirmNewPassword && (
                  <div className="flex items-center gap-2 text-xs">
                    {newPassword === confirmNewPassword ? (
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
                disabled={passwordChangeLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {passwordChangeLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang cập nhật...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    <span>Đổi mật khẩu</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Password Tips */}
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-2 text-sm">💡 Gợi ý mật khẩu an toàn:</h4>
              <ul className="space-y-1 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Sử dụng ít nhất 8 ký tự</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Tránh sử dụng thông tin cá nhân dễ đoán</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
