import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  ShieldAlert,
  Search,
  CreditCard,
  QrCode,
  Wallet,
  Building2,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { api, type Bill, type Apartment } from "../../services/api";
import { Permissions, type UserRole } from "../../utils/permissions";
import { toast } from "sonner";
import { subMonths } from "date-fns";

interface OfflinePaymentsTabProps {
  role: string;
}

export function OfflinePaymentsTab({ role }: OfflinePaymentsTabProps) {
  // Search state
  const [apartmentId, setApartmentId] = useState("");
  const [searching, setSearching] = useState(false);

  // Bills state
  const [unpaidBills, setUnpaidBills] = useState<Bill[]>([]);
  const [selectedBills, setSelectedBills] = useState<number[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "direct" | null>(
    null,
  );
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [transCode, setTransCode] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [apartments, setApartments] = useState<Apartment[]>([]);

  const fetchApartments = async () => {
    try {
      const apartments = await api.apartments.getAll();
      setApartments(apartments);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách căn hộ");
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const canAccess = Permissions.canManageOfflinePayments(role as UserRole);

  if (!canAccess) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-gray-900 mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600 text-center">
            Chỉ Accountant và Admin mới có quyền xử lý thanh toán ngoại tuyến
          </p>
        </CardContent>
      </Card>
    );
  }

  const toBillTypeString = (bill: Bill) => {
    const deadline = new Date(bill.deadline!);

    const lastMonth = subMonths(deadline, 1);
    const month = lastMonth.getMonth() + 1;
    const year = lastMonth.getFullYear();

    if (bill.typeOfBill === "SERVICE") {
      return `Phí Dịch Vụ Tháng ${month}/${year}`;
    } else if (bill.typeOfBill === "WATER") {
      return `Tiền Nước Tháng ${month}/${year}`;
    } else if (bill.typeOfBill === "ELECTRICITY") {
      return `Tiền Điện Tháng ${month}/${year}`;
    } else {
      return bill.typeOfBill;
    }
  };

  const handleSearchBills = async () => {
    if (!apartmentId.trim()) {
      toast.error("Vui lòng nhập mã căn hộ");
      return;
    }

    setSearching(true);
    setHasSearched(true);

    try {
      // Get all bills for the apartment with status filter
      const bills = await api.accounting.getAllBills(
        apartmentId.trim(),
        "Unpaid",
      );
      setUnpaidBills(bills);

      if (bills.length === 0) {
        toast.info(
          `Không tìm thấy hóa đơn chưa thanh toán cho căn hộ ${apartmentId}`,
        );
      } else {
        toast.success(`Tìm thấy ${bills.length} hóa đơn chưa thanh toán`);
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách hóa đơn");
      setUnpaidBills([]);
    } finally {
      setSearching(false);
    }
  };

  const toggleBillSelection = (billId: number) => {
    setSelectedBills((prev) =>
      prev.includes(billId)
        ? prev.filter((id) => id !== billId)
        : [...prev, billId],
    );
  };

  const handleOpenPaymentModal = () => {
    if (selectedBills.length === 0) {
      toast.error("Vui lòng chọn ít nhất một hóa đơn");
      return;
    }
    setShowPaymentModal(true);
    setPaymentMethod(null);
    setQrCodeUrl(null);
  };

  const handlePaymentMethodSelect = async (method: "qr" | "direct") => {
    setPaymentMethod(method);

    setProcessingPayment(true);
    try {
      const response = await api.offlinePayments.createTransaction(
        apartmentId,
        selectedBills,
      );

      if (method === "qr") {
        setQrCodeUrl(response.qr_url);
      } else if (method === "direct") {
        setTransCode(response.trans_code);
        setTotalAmount(response.total_amount);
      }

      toast.success("Đã tạo giao dịch thành công");
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo mã QR");
      setPaymentMethod(null);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleVerifyPayment = async () => {
    setProcessingPayment(true);
    try {
      const verifyMessage = await api.offlinePayments.verifyTransaction(
        transCode!,
        totalAmount,
      );
      if (verifyMessage.success) {
        toast.success("Thanh toán thành công!");
      }

      // Reset and refresh
      setSelectedBills([]);
      setShowPaymentModal(false);
      setPaymentMethod(null);
      handleSearchBills(); // Refresh the bill list
    } catch (error: any) {
      toast.error(error.message || "Vui lòng thử lại");
      setPaymentMethod(null);
    } finally {
      setProcessingPayment(false);
    }
  };

  const calculateTotal = () => {
    return unpaidBills
      .filter((bill) => selectedBills.includes(bill.billID))
      .reduce((sum, bill) => sum + (bill.total || 0), 0);
  };

  return (
    <div className="space-y-6 py-8 max-w-6xl mx-auto px-4">
      {/* Search Section */}
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-3">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-white">
                Thanh toán ngoại tuyến
              </CardTitle>
              <p className="text-blue-100 text-sm mt-1">
                Tìm kiếm và xử lý thanh toán cho căn hộ
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="apartmentId" className="text-gray-700 mb-2 block">
                Mã căn hộ
              </Label>
              <Select
                value={apartmentId}
                onValueChange={(value) => setApartmentId(value)}
              >
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 cursor-pointer">
                  <SelectValue placeholder="Chọn mã căn hộ (VD: A101, B205)" />
                </SelectTrigger>
                <SelectContent>
                  {apartments.map((apartment) => (
                    <SelectItem
                      key={apartment.apartmentID}
                      value={apartment.apartmentID}
                    >
                      {apartment.apartmentID}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearchBills}
                disabled={searching}
                className="h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 cursor-pointer"
              >
                {searching ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang tìm...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    <span>Tìm kiếm</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unpaid Bills Section */}
      {hasSearched && (
        <Card className="shadow-lg border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  Hóa đơn chưa thanh toán{" "}
                  {apartmentId && `- Căn hộ ${apartmentId}`}
                </CardTitle>
                <p className="text-blue-100 text-sm mt-1">
                  {unpaidBills.length} hóa đơn được tìm thấy
                </p>
              </div>
              {selectedBills.length > 0 && (
                <Badge className="bg-white text-blue-600 px-3 py-1">
                  Đã chọn: {selectedBills.length}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {unpaidBills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CreditCard className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">
                  Không có hóa đơn chưa thanh toán
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-6">
                  {unpaidBills.map((bill) => (
                    <div
                      key={bill.billID}
                      className="flex items-center justify-between p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => toggleBillSelection(bill.billID)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedBills.includes(bill.billID)}
                          onChange={() => {}}
                          className="w-5 h-5 accent-blue-600 cursor-pointer"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            #{bill.billID} - {toBillTypeString(bill)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Hạn thanh toán:{" "}
                            {bill.deadline
                              ? new Date(bill.deadline).toLocaleDateString(
                                  "vi-VN",
                                )
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {(bill.total || 0).toLocaleString("vi-VN")} ₫
                        </p>
                        {bill.status === "Overdue" && (
                          <span className="text-xs text-red-600 font-medium">
                            Quá hạn
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total and Payment Button */}
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {calculateTotal().toLocaleString("vi-VN")} ₫
                    </span>
                  </div>

                  <Button
                    onClick={handleOpenPaymentModal}
                    disabled={selectedBills.length === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 cursor-pointer"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Xử lý thanh toán ({selectedBills.length} hóa đơn)
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Method Selection Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-blue-900 text-2xl">
              Chọn phương thức thanh toán
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Tổng thanh toán:{" "}
              <span className="font-bold text-blue-600">
                {calculateTotal().toLocaleString("vi-VN")} ₫
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            {paymentMethod === null ? (
              // Payment method selection
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handlePaymentMethodSelect("qr")}
                  disabled={processingPayment}
                  className="flex flex-col items-center justify-center p-8 border-2 border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all group cursor-pointer"
                >
                  <div className="bg-blue-100 rounded-full p-4 mb-4 group-hover:bg-blue-200 transition-colors">
                    <QrCode className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Thanh toán QR
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Tạo mã QR để cư dân quét và thanh toán
                  </p>
                </button>

                <button
                  onClick={() => handlePaymentMethodSelect("direct")}
                  disabled={processingPayment}
                  className="flex flex-col items-center justify-center p-8 border-2 border-green-300 rounded-lg hover:bg-green-50 hover:border-green-500 transition-all group cursor-pointer"
                >
                  <div className="bg-green-100 rounded-full p-4 mb-4 group-hover:bg-green-200 transition-colors">
                    <Wallet className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Thanh toán trực tiếp
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Xác nhận thanh toán bằng tiền mặt
                  </p>
                </button>
              </div>
            ) : paymentMethod === "qr" && qrCodeUrl ? (
              // QR Code display
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-md border-2 border-blue-200">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Thanh Toán"
                    className="w-full max-w-sm h-auto"
                  />
                </div>
                <p className="text-gray-600 text-center">
                  Quét mã QR để thanh toán {selectedBills.length} hóa đơn
                </p>
                <Button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentMethod(null);
                    setQrCodeUrl(null);
                    handleSearchBills(); // Refresh the bill list
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Đóng
                </Button>
              </div>
            ) : paymentMethod === "direct" ? (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-gray-600 text-center">
                  Xác nhận cư dân thanh toán bằng tiền mặt
                </p>
                <Button
                  onClick={() => handleVerifyPayment()}
                  className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Xác nhận
                </Button>
              </div>
            ) : processingPayment ? (
              // Loading state
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Đang xử lý thanh toán...</p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
