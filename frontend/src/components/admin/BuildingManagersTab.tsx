import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ShieldAlert, ClipboardList, Plus, Pencil, Trash2 } from "lucide-react";
import {
  api,
  type BuildingManager,
  type BuildingManagerCreate,
  type BuildingManagerUpdate,
} from "../../services/api";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { Permissions, type UserRole } from "../../utils/permissions";
import { toast } from "sonner";

interface BuildingManagersTabProps {
  role: string;
}

export function BuildingManagersTab({ role }: BuildingManagersTabProps) {
  const [managers, setManagers] = useState<BuildingManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedManager, setSelectedManager] =
    useState<BuildingManager | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<BuildingManagerCreate>({
    name: "",
    phoneNumber: "",
    username: "",
  });

  const [editForm, setEditForm] = useState<BuildingManagerUpdate>({
    name: "",
    phoneNumber: "",
    username: "",
  });

  const canAccess = Permissions.canManageBuildingManagers(role as UserRole);

  useEffect(() => {
    if (canAccess) {
      loadManagers();
    }
  }, [canAccess]);

  const loadManagers = async () => {
    try {
      const data = await api.buildingManagers.getAll();
      setManagers(data);
    } catch (error) {
      console.error("Failed to load managers:", error);
      toast.error("Không thể tải danh sách quản lý tòa nhà");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.buildingManagers.create(createForm);
      toast.success("Thêm quản lý tòa nhà thành công");
      setCreateDialogOpen(false);
      setCreateForm({
        name: "",
        phoneNumber: "",
        username: "",
      });
      loadManagers();
    } catch (error: any) {
      toast.error(error.message || "Không thể thêm quản lý tòa nhà");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager) return;

    try {
      await api.buildingManagers.update(selectedManager.managerID, editForm);
      toast.success("Cập nhật quản lý tòa nhà thành công");
      setEditDialogOpen(false);
      loadManagers();
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật quản lý tòa nhà");
    }
  };

  const handleDelete = async () => {
    if (!selectedManager) return;

    try {
      await api.buildingManagers.delete(selectedManager.managerID);
      toast.success("Xóa quản lý tòa nhà thành công");
      setDeleteDialogOpen(false);
      loadManagers();
    } catch (error: any) {
      toast.error(error.message || "Không thể xóa quản lý tòa nhà");
    }
  };

  const openEditDialog = (manager: BuildingManager) => {
    setSelectedManager(manager);
    setEditForm({
      name: manager.name,
      phoneNumber: manager.phoneNumber,
      username: manager.username,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (manager: BuildingManager) => {
    setSelectedManager(manager);
    setDeleteDialogOpen(true);
  };

  if (!canAccess) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-gray-900 mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600 text-center">
            Chỉ Manager và Admin mới có quyền quản lý quản lý tòa nhà
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
          <CardTitle className="py-4 text-white">
            Danh sách quản lý tòa nhà
          </CardTitle>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Thêm quản lý
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm quản lý tòa nhà mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin quản lý tòa nhà mới vào hệ thống
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Họ tên *</Label>
                  <Input
                    id="create-name"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-phoneNumber">Số điện thoại</Label>
                  <Input
                    id="create-phoneNumber"
                    value={createForm.phoneNumber}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        phoneNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-username">Tài khoản</Label>
                  <Input
                    id="create-username"
                    value={createForm.username}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, username: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    className="cursor-pointer"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    Thêm quản lý
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {managers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">
                Không có quản lý tòa nhà nào
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="text-blue-900">ID</TableHead>
                    <TableHead className="text-blue-900">Họ tên</TableHead>
                    <TableHead className="text-blue-900">
                      Số điện thoại
                    </TableHead>
                    <TableHead className="text-blue-900">Tài khoản</TableHead>
                    <TableHead className="text-blue-900 text-right">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managers.map((manager) => (
                    <TableRow key={manager.managerID}>
                      <TableCell>{manager.managerID}</TableCell>
                      <TableCell>{manager.name || "N/A"}</TableCell>
                      <TableCell>{manager.phoneNumber || "N/A"}</TableCell>
                      <TableCell>{manager.username || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50 cursor-pointer"
                            onClick={() => openEditDialog(manager)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50 cursor-pointer"
                            onClick={() => openDeleteDialog(manager)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa quản lý tòa nhà</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin quản lý {selectedManager?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Họ tên *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phoneNumber">Số điện thoại</Label>
              <Input
                id="edit-phoneNumber"
                value={editForm.phoneNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, phoneNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Tài khoản</Label>
              <Input
                id="edit-username"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                className="cursor-pointer"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Cập nhật
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa quản lý tòa nhà</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa quản lý "{selectedManager?.name}" không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
