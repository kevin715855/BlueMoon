import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ShieldAlert, Building as BuildingIcon, Edit } from "lucide-react";
import { api, type Building, type BuildingManager } from "../../services/api";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { Permissions, type UserRole } from "../../utils/permissions";
import { toast } from "sonner";

interface BuildingManagementTabProps {
  role: string;
}

export function BuildingManagementTab({ role }: BuildingManagementTabProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [managers, setManagers] = useState<BuildingManager[]>([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );
  const [newManagerId, setNewManagerId] = useState<string>("");

  const canAccess = Permissions.canManageBuildings(role as UserRole);

  useEffect(() => {
    if (canAccess) {
      loadData();
    }
  }, [canAccess]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all building managers first
      const managersData = await api.buildingManagers.getAll();
      setManagers(managersData);

      // Load buildings for each manager
      const allBuildings: Building[] = [];
      for (const manager of managersData) {
        try {
          const managerBuildings = await api.buildings.getByManager(
            manager.managerID,
          );
          allBuildings.push(...managerBuildings);
        } catch (error) {
          // Manager might not have any buildings
          console.log(`No buildings for manager ${manager.managerID}`);
        }
      }

      setBuildings(allBuildings);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (building: Building) => {
    setSelectedBuilding(building);
    setNewManagerId(building.managerID?.toString() || "");
    setEditDialogOpen(true);
  };

  const handleUpdateManager = async () => {
    if (!selectedBuilding) return;

    const managerId = newManagerId === "" ? null : parseInt(newManagerId);

    if (
      newManagerId !== "" &&
      (isNaN(managerId as number) || (managerId as number) < 0)
    ) {
      toast.error("Mã quản lý không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      await api.buildings.updateManager(
        selectedBuilding.buildingID,
        managerId!,
      );

      toast.success("Cập nhật quản lý thành công");
      setEditDialogOpen(false);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật quản lý");
    } finally {
      setLoading(false);
    }
  };

  const getManagerName = (managerId: number | null | undefined): string => {
    if (!managerId) return "Chưa có quản lý";
    const manager = managers.find((m) => m.managerID === managerId);
    return manager?.name || `Manager #${managerId}`;
  };

  if (!canAccess) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-gray-900 mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600 text-center">
            Chỉ Manager và Admin mới có quyền quản lý tòa nhà
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="py-2 text-white flex items-center gap-2">
            Quản lý tòa nhà
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && buildings.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : buildings.length === 0 ? (
            <div className="text-center py-12">
              <BuildingIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không có tòa nhà nào</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <TableHead className="text-blue-900">Mã tòa nhà</TableHead>
                    <TableHead className="text-blue-900">Địa chỉ</TableHead>
                    <TableHead className="text-blue-900">Số căn hộ</TableHead>
                    <TableHead className="text-blue-900">Quản lý</TableHead>
                    <TableHead className="text-blue-900 text-center">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildings.map((building) => (
                    <TableRow
                      key={building.buildingID}
                      className="hover:bg-blue-50/50"
                    >
                      <TableCell className="font-medium">
                        {building.buildingID}
                      </TableCell>
                      <TableCell>{building.address || "N/A"}</TableCell>
                      <TableCell>{building.numApartment || 0}</TableCell>
                      <TableCell>
                        {getManagerName(building.managerID)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(building)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Chỉnh sửa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Manager Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BuildingIcon className="w-5 h-5 text-blue-600" />
              Cập nhật quản lý tòa nhà
            </DialogTitle>
            <DialogDescription>
              Thay đổi quản lý phụ trách tòa nhà {selectedBuilding?.buildingID}
            </DialogDescription>
          </DialogHeader>

          {selectedBuilding && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Thông tin tòa nhà
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã tòa nhà:</span>
                    <span className="font-medium">
                      {selectedBuilding.buildingID}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Địa chỉ:</span>
                    <span className="font-medium">
                      {selectedBuilding.address || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số căn hộ:</span>
                    <span className="font-medium">
                      {selectedBuilding.numApartment || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quản lý hiện tại:</span>
                    <span className="font-medium">
                      {getManagerName(selectedBuilding.managerID)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerId">Quản lý mới</Label>
                <select
                  id="managerId"
                  value={newManagerId}
                  onChange={(e) => setNewManagerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {managers.length == 0 ? (
                    <option value="">-- Không có quản lý --</option>
                  ) : (
                    managers.map((manager) => (
                      <option key={manager.managerID} value={manager.managerID}>
                        {manager.name} (ID: {manager.managerID})
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs text-gray-500">
                  Chọn quản lý mới cho tòa nhà này hoặc để trống để bỏ quản lý
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setEditDialogOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              onClick={handleUpdateManager}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
