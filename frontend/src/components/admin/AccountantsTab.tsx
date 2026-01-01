import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { ShieldAlert, Calculator, Plus, Pencil, Trash2 } from "lucide-react";
import { api, type Accountant, type AccountantCreate, type AccountantUpdate } from "../../services/api";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { Permissions, type UserRole } from "../../utils/permissions";
import { toast } from "sonner";

interface AccountantsTabProps {
  role: string;
}

export function AccountantsTab({ role }: AccountantsTabProps) {
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccountant, setSelectedAccountant] = useState<Accountant | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<AccountantCreate>({
    fullName: "",
    phoneNumber: "",
    email: "",
    username: "",
  });

  const [editForm, setEditForm] = useState<AccountantUpdate>({
    fullName: "",
    phoneNumber: "",
    email: "",
    username: "",
  });

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
      toast.error("Không thể tải danh sách kế toán");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.accountants.create(createForm);
      toast.success("Thêm kế toán thành công");
      setCreateDialogOpen(false);
      setCreateForm({
        fullName: "",
        phoneNumber: "",
        email: "",
        username: "",
      });
      loadAccountants();
    } catch (error: any) {
      toast.error(error.message || "Không thể thêm kế toán");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountant) return;

    try {
      await api.accountants.update(selectedAccountant.accountantID, editForm);
      toast.success("Cập nhật kế toán thành công");
      setEditDialogOpen(false);
      loadAccountants();
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật kế toán");
    }
  };

  const handleDelete = async () => {
    if (!selectedAccountant) return;

    try {
      await api.accountants.delete(selectedAccountant.accountantID);
      toast.success("Xóa kế toán thành công");
      setDeleteDialogOpen(false);
      loadAccountants();
    } catch (error: any) {
      toast.error(error.message || "Không thể xóa kế toán");
    }
  };

  const openEditDialog = (accountant: Accountant) => {
    setSelectedAccountant(accountant);
    setEditForm({
      fullName: accountant.fullName,
      phoneNumber: accountant.phoneNumber,
      email: accountant.email,
      username: accountant.username,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (accountant: Accountant) => {
    setSelectedAccountant(accountant);
    setDeleteDialogOpen(true);
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
    <div className="space-y-4">
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg flex flex-row items-center justify-between">
          <CardTitle className="text-white">Danh sách kế toán</CardTitle>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                <Plus className="w-4 h-4 mr-2" />
                Thêm kế toán
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm kế toán mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin kế toán mới vào hệ thống
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-fullName">Họ tên *</Label>
                  <Input
                    id="create-fullName"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-phoneNumber">Số điện thoại</Label>
                  <Input
                    id="create-phoneNumber"
                    value={createForm.phoneNumber}
                    onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-username">Tài khoản</Label>
                  <Input
                    id="create-username"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Thêm kế toán
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {accountants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calculator className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">Không có kế toán nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="text-blue-900">ID</TableHead>
                    <TableHead className="text-blue-900">Họ tên</TableHead>
                    <TableHead className="text-blue-900">Số điện thoại</TableHead>
                    <TableHead className="text-blue-900">Email</TableHead>
                    <TableHead className="text-blue-900">Tài khoản</TableHead>
                    <TableHead className="text-blue-900 text-right">Hành động</TableHead>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => openEditDialog(accountant)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => openDeleteDialog(accountant)}
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
            <DialogTitle>Chỉnh sửa kế toán</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin kế toán {selectedAccountant?.fullName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Họ tên *</Label>
              <Input
                id="edit-fullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phoneNumber">Số điện thoại</Label>
              <Input
                id="edit-phoneNumber"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Tài khoản</Label>
              <Input
                id="edit-username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
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
            <AlertDialogTitle>Xác nhận xóa kế toán</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa kế toán "{selectedAccountant?.fullName}" không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
