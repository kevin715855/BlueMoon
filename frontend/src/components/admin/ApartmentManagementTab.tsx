import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ShieldAlert, Building } from "lucide-react";
import { api, type Apartment } from "../../services/api";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { Permissions, type UserRole } from "../../utils/permissions";

interface ApartmentManagementTabProps {
  role: string;
}

export function ApartmentManagementTab({ role }: ApartmentManagementTabProps) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  const canAccess = Permissions.canViewApartments(role as UserRole);

  useEffect(() => {
    if (canAccess) {
      loadApartments();
    }
  }, [canAccess]);

  const loadApartments = async () => {
    try {
      const data = await api.apartments.getAll();
      setApartments(data);
    } catch (error) {
      console.error("Failed to load apartments:", error);
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
            Chỉ Accountant, Manager và Admin mới có quyền xem danh sách căn hộ
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
        <CardTitle className="text-white">Danh sách căn hộ</CardTitle>
      </CardHeader>
      <CardContent>
        {apartments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Building className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">Không có căn hộ nào</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead className="text-blue-900">Mã căn hộ</TableHead>
                <TableHead className="text-blue-900">Số cư dân</TableHead>
                <TableHead className="text-blue-900">Trạng thái</TableHead>
                <TableHead className="text-blue-900">Mã tòa nhà</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apartments.map((apartment) => (
                <TableRow key={apartment.apartmentID}>
                  <TableCell>{apartment.apartmentID}</TableCell>
                  <TableCell>{apartment.numResident || 0}</TableCell>
                  <TableCell>{apartment.status || "N/A"}</TableCell>
                  <TableCell>{apartment.buildingID || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
