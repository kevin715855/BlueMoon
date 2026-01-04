import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, Building, FileText, UserCog } from "lucide-react";
import { api } from "../../services/api";
import { LoadingSpinner } from "../shared/LoadingSpinner";

interface AdminOverviewTabProps {
  role: string;
}

export function AdminOverviewTab({ role }: AdminOverviewTabProps) {
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalApartments: 0,
    unpaidBills: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch data in parallel
      const [residents, apartments, buildingManagers, accountants] =
        await Promise.all([
          api.residents.getAll(0, 1000),
          api.apartments.getAll(0, 1000),
          api.buildingManagers.getAll(),
          api.accountants.getAll(),
        ]);

      // Count total admins (managers + accountants)
      const totalAdmins = buildingManagers.length + accountants.length;

      setStats({
        totalResidents: residents.length,
        totalApartments: apartments.length,
        unpaidBills: 0, // Will be updated if we have access to all bills
        totalAdmins,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {role != "Accountant" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-blue-50">
              <CardTitle className="text-sm text-blue-900">
                Tổng cư dân
              </CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{stats.totalResidents}</div>
              <p className="text-xs text-gray-500 mt-1">Đang sinh sống</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-blue-50">
              <CardTitle className="text-sm text-blue-900">
                Tổng căn hộ
              </CardTitle>
              <Building className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{stats.totalApartments}</div>
              <p className="text-xs text-gray-500 mt-1">Trong hệ thống</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-blue-50">
              <CardTitle className="text-sm text-blue-900">
                Chưa thanh toán
              </CardTitle>
              <FileText className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{stats.unpaidBills}</div>
              <p className="text-xs text-gray-500 mt-1">Hóa đơn</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-blue-50">
              <CardTitle className="text-sm text-blue-900">
                Tài khoản quản trị
              </CardTitle>
              <UserCog className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{stats.totalAdmins}</div>
              <p className="text-xs text-gray-500 mt-1">Quản lý & Kế toán</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
