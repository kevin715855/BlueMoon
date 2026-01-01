import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { CheckCircle, Clock, XCircle, QrCode, CreditCard } from "lucide-react";
import { api, type PaymentTransaction, type Bill } from "../../services/api";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { toast } from "sonner";

export function ResidentPaymentsTab() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBills, setSelectedBills] = useState<number[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentData, billData] = await Promise.all([
        api.payments.getMyHistory(),
        api.bills.getMyBills(),
      ]);

      setPayments(paymentData.slice(0, 10));
      setUnpaidBills(billData.filter((b) => b.status === "Unpaid" || b.status === "Overdue"));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQR = async () => {
    if (selectedBills.length === 0) {
      toast.error("Vui lòng chọn ít nhất một hóa đơn");
      return;
    }

    try {
      const response = await api.payments.createQR(selectedBills);
      setQrCodeUrl(response.qr_url);
      setShowQrModal(true);
      setSelectedBills([]);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Tạo mã QR thất bại");
    }
  };

  const toggleBillSelection = (billId: number) => {
    setSelectedBills((prev) =>
      prev.includes(billId)
        ? prev.filter((id) => id !== billId)
        : [...prev, billId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return (
          <Badge className="bg-green-500 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Thành công
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-yellow-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Đang xử lý
          </Badge>
        );
      case "Failed":
        return (
          <Badge className="bg-red-500 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Thất bại
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Unpaid Bills Section */}
      {unpaidBills.length > 0 && (
        <Card className="shadow-lg border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-white">Hóa đơn chưa thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {unpaidBills.map((bill) => (
                <div
                  key={bill.billID}
                  className="flex items-center justify-between p-4 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => toggleBillSelection(bill.billID)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedBills.includes(bill.billID)}
                      onChange={() => {}}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <div>
                      <p>
                        #{bill.billID} - {bill.typeOfBill}
                      </p>
                      <p className="text-sm text-gray-500">
                        Hạn: {bill.deadline ? new Date(bill.deadline).toLocaleDateString("vi-VN") : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p>{(bill.total || 0).toLocaleString("vi-VN")} ₫</p>
                    {bill.status === "Overdue" && (
                      <span className="text-xs text-red-500">Quá hạn</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={handleCreateQR}
              disabled={selectedBills.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
              Tạo mã QR thanh toán ({selectedBills.length} hóa đơn)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-white">Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-900">Mã giao dịch</TableHead>
                  <TableHead className="text-blue-900">Nội dung</TableHead>
                  <TableHead className="text-blue-900">Phương thức</TableHead>
                  <TableHead className="text-blue-900">Số tiền</TableHead>
                  <TableHead className="text-blue-900">Ngày thanh toán</TableHead>
                  <TableHead className="text-blue-900">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.transID}>
                    <TableCell>#{payment.transID}</TableCell>
                    <TableCell>{payment.paymentContent || "N/A"}</TableCell>
                    <TableCell>{
                        payment.paymentMethod == "Online_Payment" ? "Online" : payment.paymentMethod || "N/A"
                    }</TableCell>
                    <TableCell>{payment.amount.toLocaleString("vi-VN")} ₫</TableCell>
                    <TableCell>
                      {payment.payDate
                        ? new Date(payment.payDate).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-blue-900">Mã QR Thanh Toán</DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Quét mã QR để thanh toán hóa đơn
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 p-6">
            {qrCodeUrl ? (
              <>
                <div className="bg-white p-4 rounded-lg shadow-md border-2 border-blue-200">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Thanh Toán"
                    className="w-full max-w-sm h-auto"
                  />
                </div>
                <Button
                  onClick={() => setShowQrModal(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Đóng
                </Button>
              </>
            ) : (
              <div className="py-8">
                <p className="text-gray-500 text-center">Không có mã QR</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
