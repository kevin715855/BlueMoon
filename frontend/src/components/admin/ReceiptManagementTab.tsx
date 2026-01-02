import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { ShieldAlert, Receipt as ReceiptIcon, Search, Download, FileText } from "lucide-react";
import { api, type Receipt } from "../../services/api";
import { Permissions, type UserRole } from "../../utils/permissions";
import { toast } from "sonner";

interface ReceiptManagementTabProps {
  role: string;
}

export function ReceiptManagementTab({ role }: ReceiptManagementTabProps) {
  const [transactionId, setTransactionId] = useState<string>("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const canAccess = Permissions.canViewReceipts(role as UserRole);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId || transactionId.trim() === "") {
      toast.error("Vui lòng nhập mã giao dịch");
      return;
    }

    const id = parseInt(transactionId);
    if (isNaN(id) || id <= 0) {
      toast.error("Mã giao dịch không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const data = await api.receipts.get(id);
      setReceipt(data);
      setViewDialogOpen(true);
      toast.success("Tải biên lai thành công");
    } catch (error: any) {
      toast.error(error.message || "Không thể tải biên lai");
      setReceipt(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!receipt) return;

    const token = localStorage.getItem("access_token");
    const url = `http://localhost:8000/api/receipts/${receipt.transID}/pdf`;

    // Open in new tab with auth token
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";

    // Add authorization header via fetch and download
    fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `receipt_${receipt.transID}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        toast.success("Đang tải xuống biên lai PDF");
      })
      .catch(error => {
        console.error("Download error:", error);
        toast.error("Không thể tải xuống PDF");
      });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  if (!canAccess) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-gray-900 mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600 text-center">
            Chỉ Accountant và Admin mới có quyền xem biên lai thanh toán
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-white flex items-center gap-2">
            <ReceiptIcon className="w-6 h-6" />
            Tra cứu biên lai thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-4">
                <Label htmlFor="transactionId">Mã giao dịch</Label>
                <Input
                  id="transactionId"
                  type="number"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Nhập mã giao dịch"
                  min="1"
                  required
                />
              </div>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Đang tìm...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Tra cứu
                  </>
                )}
              </Button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-blue-900">
                    <strong>Hướng dẫn:</strong> Nhập mã giao dịch để tra cứu và xem biên lai thanh toán.
                  </p>
                  <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                    <li>Có thể tải xuống biên lai dưới dạng PDF</li>
                    <li>Biên lai bao gồm thông tin cư dân và chi tiết hóa đơn</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* View Receipt Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ReceiptIcon className="w-5 h-5 text-blue-600" />
              Biên lai thanh toán #{receipt?.transID}
            </DialogTitle>
            <DialogDescription>
              Chi tiết giao dịch và hóa đơn đã thanh toán
            </DialogDescription>
          </DialogHeader>

          {receipt && (
            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">Thông tin giao dịch</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <p className="font-medium text-gray-900">#{receipt.transID}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <p className="font-medium">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        receipt.status === "Success"
                          ? "bg-green-100 text-green-800"
                          : receipt.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {receipt.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày thanh toán:</span>
                    <p className="font-medium text-gray-900">{formatDate(receipt.payDate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phương thức:</span>
                    <p className="font-medium text-gray-900">{
                      receipt.paymentMethod != "Offline" ? "Online" : receipt.paymentMethod || "N/A"
                    }</p>
                  </div>
                </div>
              </div>

              {/* Resident Info */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông tin cư dân</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Họ tên:</span>
                    <p className="font-medium text-gray-900">{receipt.residentName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Mã cư dân:</span>
                    <p className="font-medium text-gray-900">#{receipt.residentID}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Căn hộ:</span>
                    <p className="font-medium text-gray-900">{receipt.apartmentID}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Số điện thoại:</span>
                    <p className="font-medium text-gray-900">{receipt.phoneNumber || "N/A"}</p>
                  </div>
                </div>
                {receipt.paymentContent && (
                  <div className="mt-3">
                    <span className="text-gray-600 text-sm">Nội dung thanh toán:</span>
                    <p className="font-medium text-gray-900 text-sm mt-1">{receipt.paymentContent}</p>
                  </div>
                )}
              </div>

              {/* Bills Table */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Chi tiết hóa đơn ({receipt.bills.length})</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead className="text-blue-900">Mã HĐ</TableHead>
                        <TableHead className="text-blue-900">Loại hóa đơn</TableHead>
                        <TableHead className="text-blue-900">Hạn thanh toán</TableHead>
                        <TableHead className="text-blue-900 text-right">Số tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipt.bills.map((bill) => (
                        <TableRow key={bill.billID}>
                          <TableCell className="font-medium">#{bill.billID}</TableCell>
                          <TableCell>{bill.billName}</TableCell>
                          <TableCell>{formatDate(bill.dueDate)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(bill.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Total */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">TỔNG CỘNG:</span>
                  <span className="text-2xl font-bold text-green-700">
                    {formatCurrency(receipt.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Đóng
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleDownloadPDF}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tải xuống PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
