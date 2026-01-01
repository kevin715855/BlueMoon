import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ShieldAlert, Calculator } from "lucide-react";
import { api, type Accountant } from "../../services/api";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { Permissions, type UserRole } from "../../utils/permissions";

interface AccountantsTabProps {
  role: string;
}

export function AccountantsTab({ role }: AccountantsTabProps) {
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [loading, setLoading] = useState(true);

  const canAccess = Permissions.canManageAccountants(role as UserRole);

  useEffect(() => {
    if (canAccess) {
      loadAccountants();
    }
  }, [canAccess]);

  const loadAccountants = async () => {
    try {
      const data = await api.accountants.getAll();
      setAccountants(data);
    } catch (error) {
      console.error("Failed to load accountants:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!canAccess) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-gray-900 mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600 text-center">
            Chỉ Manager và Admin mới có quyền quản lý kế toán
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="shadow-lg border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-white">Danh sách kế toán</CardTitle>
      </CardHeader>
      <CardContent>
        {accountants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Calculator className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">Không có kế toán nào</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead className="text-blue-900">ID</TableHead>
                <TableHead className="text-blue-900">Họ tên</TableHead>
                <TableHead className="text-blue-900">Số điện thoại</TableHead>
                <TableHead className="text-blue-900">Email</TableHead>
                <TableHead className="text-blue-900">Tài khoản</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountants.map((accountant) => (
                <TableRow key={accountant.accountantID}>
                  <TableCell>{accountant.accountantID}</TableCell>
                  <TableCell>{accountant.fullName || "N/A"}</TableCell>
                  <TableCell>{accountant.phoneNumber || "N/A"}</TableCell>
                  <TableCell>{accountant.email || "N/A"}</TableCell>
                  <TableCell>{accountant.username || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
