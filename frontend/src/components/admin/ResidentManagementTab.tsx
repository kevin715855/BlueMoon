import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
import { Checkbox } from "../ui/checkbox";
import {
  ShieldAlert,
  Users,
  Plus,
  Pencil,
  Trash2,
  Building2,
} from "lucide-react";
import {
  api,
  type Resident,
  type ResidentCreate,
  type ResidentUpdate,
  type Apartment,
} from "../../services/api";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { Permissions, type UserRole } from "../../utils/permissions";
import { toast } from "sonner";

interface ResidentManagementTabProps {
  role: string;
}

export function ResidentManagementTab({ role }: ResidentManagementTabProps) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null,
  );

  // Form states
  const [createForm, setCreateForm] = useState<ResidentCreate>({
    apartmentID: "",
    fullName: "",
    age: 0,
    date: "",
    phoneNumber: "",
    isOwner: false,
    username: "",
  });

  const [editForm, setEditForm] = useState<ResidentUpdate>({
    apartmentID: "",
    fullName: "",
    age: 0,
    date: "",
    phoneNumber: "",
    isOwner: false,
    username: "",
  });

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
      toast.error("Không thể tải danh sách cư dân");
    } finally {
      setLoading(false);
    }
  };

  const loadApartments = async () => {
    setLoadingApartments(true);
    try {
      const data = await api.apartments.getAll();
      setApartments(data);
    } catch (error) {
      console.error("Failed to load apartments:", error);
      toast.error("Không thể tải danh sách căn hộ");
    } finally {
      setLoadingApartments(false);
    }
  };

  // Load apartments when create dialog opens
  const handleCreateDialogOpen = (open: boolean) => {
    setCreateDialogOpen(open);
    if (open && apartments.length === 0) {
      loadApartments();
    }
  };

  // Load apartments when edit dialog opens
  const openEditDialog = (resident: Resident) => {
    setSelectedResident(resident);
    setEditForm({
      apartmentID: resident.apartmentID,
      fullName: resident.fullName,
      age: resident.age,
      date: resident.date,
      phoneNumber: resident.phoneNumber,
      isOwner: resident.isOwner,
      username: resident.username,
    });
    setEditDialogOpen(true);
    if (apartments.length === 0) {
      loadApartments();
    }
  };

  const openDeleteDialog = (resident: Resident) => {
    setSelectedResident(resident);
    setDeleteDialogOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.residents.create(createForm);
      toast.success("Thêm cư dân thành công");
      setCreateDialogOpen(false);
      setCreateForm({
        apartmentID: "",
        fullName: "",
        age: 0,
        date: "",
        phoneNumber: "",
        isOwner: false,
        username: "",
      });
      loadResidents();
    } catch (error: any) {
      toast.error(error.message || "Không thể thêm cư dân");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResident) return;

    try {
      await api.residents.update(selectedResident.residentID, editForm);
      toast.success("Cập nhật cư dân thành công");
      setEditDialogOpen(false);
      loadResidents();
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật cư dân");
    }
  };

  const handleDelete = async () => {
    if (!selectedResident) return;

    try {
      await api.residents.delete(selectedResident.residentID);
      toast.success("Xóa cư dân thành công");
      setDeleteDialogOpen(false);
      loadResidents();
    } catch (error: any) {
      toast.error(error.message || "Không thể xóa cư dân");
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
    <div className="space-y-4">
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg flex flex-row items-center justify-between">
          <CardTitle className="py-4 text-white">Danh sách cư dân</CardTitle>
          <Dialog open={createDialogOpen} onOpenChange={handleCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Thêm cư dân
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm cư dân mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin ư dân mới vào hệ thống
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-fullName">Họ tên *</Label>
                    <Input
                      id="create-fullName"
                      value={createForm.fullName}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          fullName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-apartmentID">Mã căn hộ</Label>
                    <Select
                      value={createForm.apartmentID}
                      onValueChange={(value) =>
                        setCreateForm({ ...createForm, apartmentID: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn căn hộ">
                          {createForm.apartmentID || "Chọn căn hộ"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {loadingApartments ? (
                          <div className="p-4 text-center text-gray-500">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm">Đang tải...</span>
                            </div>
                          </div>
                        ) : apartments.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">Không có căn hộ nào</p>
                          </div>
                        ) : (
                          apartments.map((apartment) => (
                            <SelectItem
                              key={apartment.apartmentID}
                              value={apartment.apartmentID}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-medium">
                                  {apartment.apartmentID}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Hiện có {apartment.numResident || 0}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-age">Tuổi</Label>
                    <Input
                      id="create-age"
                      type="number"
                      min="0"
                      max="120"
                      value={createForm.age || 0}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          age: e.target.value ? parseInt(e.target.value) : 0,
                        })
                      }
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
                    <Label htmlFor="create-date">Ngày sinh</Label>
                    <Input
                      id="create-date"
                      type="date"
                      value={createForm.date}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-username">Tài khoản</Label>
                    <Input
                      id="create-username"
                      value={createForm.username}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          username: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-isOwner"
                    checked={createForm.isOwner}
                    onCheckedChange={(checked) =>
                      setCreateForm({
                        ...createForm,
                        isOwner: checked === true,
                      })
                    }
                  />
                  <Label htmlFor="create-isOwner" className="cursor-pointer">
                    Chủ hộ
                  </Label>
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
                    Thêm cư dân
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {residents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">Không có cư dân nào</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="text-blue-900">ID</TableHead>
                    <TableHead className="text-blue-900">Họ tên</TableHead>
                    <TableHead className="text-blue-900">Căn hộ</TableHead>
                    <TableHead className="text-blue-900">Tuổi</TableHead>
                    <TableHead className="text-blue-900">
                      Số điện thoại
                    </TableHead>
                    <TableHead className="text-blue-900">Chủ hộ</TableHead>
                    <TableHead className="text-blue-900 text-right">
                      Hành động
                    </TableHead>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50 cursor-pointer"
                            onClick={() => openEditDialog(resident)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50 cursor-pointer"
                            onClick={() => openDeleteDialog(resident)}
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa cư dân</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cư dân {selectedResident?.fullName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Họ tên *</Label>
                <Input
                  id="edit-fullName"
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fullName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-apartmentID">Mã căn hộ</Label>
                <Select
                  value={editForm.apartmentID}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, apartmentID: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn căn hộ">
                      {editForm.apartmentID || "Chọn căn hộ"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {loadingApartments ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm">Đang tải...</span>
                        </div>
                      </div>
                    ) : apartments.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Không có căn hộ nào</p>
                      </div>
                    ) : (
                      apartments.map((apartment) => (
                        <SelectItem
                          key={apartment.apartmentID}
                          value={apartment.apartmentID}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium">
                              {apartment.apartmentID}
                            </span>
                            <span className="text-xs text-gray-500">
                              Hiện có {apartment.numResident || 0}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-age">Tuổi</Label>
                <Input
                  id="edit-age"
                  type="number"
                  min="0"
                  max="120"
                  value={editForm.age || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      age: e.target.value ? parseInt(e.target.value) : 0,
                    })
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
                <Label htmlFor="edit-date">Ngày</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
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
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isOwner"
                checked={editForm.isOwner}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, isOwner: checked === true })
                }
              />
              <Label htmlFor="edit-isOwner" className="cursor-pointer">
                Chủ hộ
              </Label>
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
            <AlertDialogTitle>Xác nhận xóa cư dân</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cư dân "{selectedResident?.fullName}"
              không? Hành động này không thể hoàn tác.
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
