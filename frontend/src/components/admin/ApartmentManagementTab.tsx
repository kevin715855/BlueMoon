import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  ShieldAlert,
  Building,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { api, type Apartment } from "../../services/api";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { Permissions, type UserRole } from "../../utils/permissions";
import { toast } from "sonner";
import { Label } from "../ui/label";

interface ApartmentManagementTabProps {
  role: string;
}

export function ApartmentManagementTab({ role }: ApartmentManagementTabProps) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(apartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApartments = apartments.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

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
      toast.error("Không thể tải danh sách căn hộ");
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
    <div className="space-y-4">
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg flex flex-row items-center justify-between">
          <CardTitle className="py-4 text-white">Danh sách căn hộ</CardTitle>
        </CardHeader>
        <CardContent>
          {apartments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Building className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">Không có căn hộ nào</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="text-blue-900">Mã căn hộ</TableHead>
                    <TableHead className="text-blue-900">Số cư dân</TableHead>
                    <TableHead className="text-blue-900">Mã tòa nhà</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApartments.map((apartment) => (
                    <TableRow key={apartment.apartmentID}>
                      <TableCell>{apartment.apartmentID}</TableCell>
                      <TableCell>{apartment.numResident || 0}</TableCell>
                      <TableCell>{apartment.buildingID || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {apartments.length > 0 && (
        <Card className="shadow-lg border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <Label htmlFor="itemsPerPage" className="text-gray-700">
                  Hiển thị:
                </Label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue>{itemsPerPage}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-gray-600">căn hộ/trang</span>
              </div>

              {/* Page info and navigation */}
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">
                  Hiển thị {startIndex + 1}-
                  {Math.min(endIndex, apartments.length)} của{" "}
                  {apartments.length} căn hộ
                </span>
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 py-1 bg-blue-50 text-blue-900 rounded border border-blue-200">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
