import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ShieldAlert } from "lucide-react";
import { api, type Resident } from "../../services/api";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { Permissions, type UserRole } from "../../utils/permissions";
import { Users } from "lucide-react";

interface ResidentManagementTabProps {
  role: string;
}

export function ResidentManagementTab({ role }: ResidentManagementTabProps) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  const canAccess = Permissions.canManageResidents(role as UserRole);

  useEffect(() => {
    if (canAccess) {
      loadResidents();
    }
  }, [canAccess]);

  const loadResidents = async () => {
    try {
      const data = await api.residents.getAll();
      setResidents(data);
    } catch (error) {
      console.error("Failed to load residents:", error);
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
            Chỉ Manager và Admin mới có quyền quản lý cư dân
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
        <CardTitle className="text-white">Danh sách cư dân</CardTitle>
      </CardHeader>
      <CardContent>
        {residents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">Không có cư dân nào</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead className="text-blue-900">ID</TableHead>
                <TableHead className="text-blue-900">Họ tên</TableHead>
                <TableHead className="text-blue-900">Căn hộ</TableHead>
                <TableHead className="text-blue-900">Tuổi</TableHead>
                <TableHead className="text-blue-900">Số điện thoại</TableHead>
                <TableHead className="text-blue-900">Chủ hộ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residents.map((resident) => (
                <TableRow key={resident.residentID}>
                  <TableCell>{resident.residentID}</TableCell>
                  <TableCell>{resident.fullName}</TableCell>
                  <TableCell>{resident.apartmentID || "N/A"}</TableCell>
                  <TableCell>{resident.age || "N/A"}</TableCell>
                  <TableCell>{resident.phoneNumber || "N/A"}</TableCell>
                  <TableCell>{resident.isOwner ? "Có" : "Không"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
