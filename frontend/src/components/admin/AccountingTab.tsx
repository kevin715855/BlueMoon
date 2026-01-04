import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  ShieldAlert,
  FileUp,
  FileEdit,
  DollarSign,
  Calculator,
  Plus,
  Upload,
  Receipt,
  Minus,
} from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  api,
  type MeterReadingCreate,
  type ServiceFeeCreate,
  type ServiceFeeDelete,
  type CalculateBillsRequest,
  type Apartment,
  type BillCreate,
} from "../../services/api";
import { Permissions, type UserRole } from "../../utils/permissions";
import { toast } from "sonner";

interface AccountingTabProps {
  role: string;
}

export function AccountingTab({ role }: AccountingTabProps) {
  const canAccess = Permissions.canManageOfflinePayments(role as UserRole);

  // Meter Reading state
  const [showMeterReadingModal, setShowMeterReadingModal] = useState(false);
  const [meterReadingMethod, setMeterReadingMethod] = useState<
    "csv" | "manual" | null
  >(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [meterReading, setMeterReading] = useState<MeterReadingCreate>({
    apartmentID: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    oldElectricity: 0,
    newElectricity: 0,
    oldWater: 0,
    newWater: 0,
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [processingMeterReading, setProcessingMeterReading] = useState(false);

  // Service Fee state
  const [showServiceFeeModal, setShowServiceFeeModal] = useState(false);
  const [serviceFee, setServiceFee] = useState<ServiceFeeCreate>({
    buildingID: "",
    serviceName: "Electricity",
    unitPrice: null,
  });
  const [otherBillType, setOtherBillType] = useState("");
  const [processingServiceFee, setProcessingServiceFee] = useState(false);

  // Delete Fee state
  const [showDeleteFeeModal, setShowDeleteFeeModal] = useState(false);
  const [deleteFee, setDeleteFee] = useState<ServiceFeeDelete>({
    buildingID: "",
    serviceName: "",
  });
  const [otherBillTypeDelete, setOtherBillTypeDelete] = useState("");
  const [deletingServiceFee, setDeletingServiceFee] = useState(false);

  // Calculate Bills state
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [calculateRequest, setCalculateRequest] =
    useState<CalculateBillsRequest>({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      deadline_day: 10,
      overwrite: false,
    });
  const [processingCalculation, setProcessingCalculation] = useState(false);

  // Manual Bill state
  const [showManualBillModal, setShowManualBillModal] = useState(false);
  const [manualBill, setManualBill] = useState<BillCreate>({
    apartmentID: "A",
    accountantID: 0,
    deadline: "",
    typeOfBill: "",
    amount: 0,
  });
  const [processingManualBill, setProcessingManualBill] = useState(false);

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

  if (!canAccess) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-gray-900 mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600 text-center">
            Chỉ Accountant và Admin mới có quyền truy cập chức năng kế toán
          </p>
        </CardContent>
      </Card>
    );
  }

  // ==================== Meter Reading Handlers ====================
  const handleOpenMeterReadingModal = () => {
    setShowMeterReadingModal(true);
    setMeterReadingMethod(null);
    setCsvFile(null);
  };

  const handleMeterReadingMethodSelect = (method: "csv" | "manual") => {
    setMeterReadingMethod(method);
  };

  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv") {
        toast.error("Vui lòng chọn file CSV");
        return;
      }
      setCsvFile(file);
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      toast.error("Vui lòng chọn file CSV");
      return;
    }

    setProcessingMeterReading(true);
    try {
      // Parse CSV file
      const text = await csvFile.text();
      const lines = text.split("\n").filter((line) => line.trim());

      // Skip header line
      const dataLines = lines.slice(1);

      let successCount = 0;
      let errorCount = 0;

      for (const line of dataLines) {
        const [
          apartmentID,
          month,
          year,
          oldElectricity,
          newElectricity,
          oldWater,
          newWater,
        ] = line.split(",");

        try {
          await api.accounting.recordMeterReading({
            apartmentID: apartmentID.trim(),
            month: parseInt(month.trim()),
            year: parseInt(year.trim()),
            oldElectricity: parseFloat(oldElectricity.trim()),
            newElectricity: parseFloat(newElectricity.trim()),
            oldWater: parseFloat(oldWater.trim()),
            newWater: parseFloat(newWater.trim()),
          });
          successCount++;
        } catch (error: any) {
          errorCount++;
        }
      }

      if (errorCount === 0) {
        toast.success(`Đã nhập thành công ${successCount} chỉ số công tơ`);
      } else {
        toast.warning(`Thành công: ${successCount}, Thất bại: ${errorCount}`);
      }

      setShowMeterReadingModal(false);
      setMeterReadingMethod(null);
      setCsvFile(null);
    } catch (error: any) {
      toast.error(error.message || "Không thể xử lý file CSV");
    } finally {
      setProcessingMeterReading(false);
    }
  };

  const handleManualMeterReadingSubmit = async () => {
    if (!meterReading.apartmentID) {
      toast.error("Vui lòng chọn căn hộ");
      return;
    }

    setProcessingMeterReading(true);
    try {
      await api.accounting.recordMeterReading(meterReading);
      toast.success("Đã ghi nhận chỉ số công tơ thành công");

      // Reset form
      setMeterReading({
        apartmentID: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        oldElectricity: 0,
        newElectricity: 0,
        oldWater: 0,
        newWater: 0,
      });
      setShowMeterReadingModal(false);
      setMeterReadingMethod(null);
    } catch (error: any) {
      toast.error(error.message || "Không thể ghi nhận chỉ số công tơ");
    } finally {
      setProcessingMeterReading(false);
    }
  };

  // ==================== Service Fee Handlers ====================
  const handleServiceFeeSubmit = async () => {
    if (!serviceFee.buildingID || !serviceFee.serviceName) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (serviceFee.unitPrice === null) {
      toast.error("Vui lòng nhập phí theo đơn vị hoặc phí cố định");
      return;
    }

    setProcessingServiceFee(true);
    try {
      await api.accounting.setServiceFee(serviceFee);
      toast.success("Đã thiết lập phí dịch vụ thành công");

      // Reset form
      setServiceFee({
        buildingID: "",
        serviceName: "Electricity",
        unitPrice: null,
      });
      setShowServiceFeeModal(false);
    } catch (error: any) {
      toast.error(error.message || "Không thể thiết lập phí dịch vụ");
    } finally {
      setProcessingServiceFee(false);
    }
  };

  // ==================== Delete Fee Handlers =====================
  const handleServiceFeeDelete = async () => {
    if (!deleteFee.buildingID || !deleteFee.serviceName) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setDeletingServiceFee(true);
    try {
      await api.accounting.deleteServiceFee(deleteFee);
      toast.success("Đã xóa phí dịch vụ thành công");

      // Reset form
      setDeleteFee({
        buildingID: "",
        serviceName: "",
      });
      setShowDeleteFeeModal(false);
    } catch (error: any) {
      toast.error(error.message || "Không thể xóa phí dịch vụ");
    } finally {
      setDeletingServiceFee(false);
    }
  };

  // ==================== Manual Bill Handlers ====================
  const handleManualBillSubmit = async () => {
    if (
      !manualBill.apartmentID ||
      !manualBill.deadline ||
      !manualBill.typeOfBill ||
      manualBill.amount <= 0
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setProcessingManualBill(true);
    try {
      const response = await api.accounting.getManualBill(manualBill);
      toast.success(response.message);

      // Reset form
      setManualBill({
        apartmentID: "",
        accountantID: 0,
        deadline: "",
        typeOfBill: "",
        amount: 0,
      });
      setShowManualBillModal(false);
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo hóa đơn");
    } finally {
      setProcessingManualBill(false);
    }
  };

  // ==================== Calculate Bills Handlers ====================
  const handleCalculateBills = async () => {
    setProcessingCalculation(true);
    try {
      const result = await api.accounting.calculateBills(calculateRequest);
      toast.success(`${result.message}. Đã tạo ${result.count} hóa đơn`);
      setShowCalculateModal(false);
    } catch (error: any) {
      toast.error(error.message || "Không thể tính toán hóa đơn");
    } finally {
      setProcessingCalculation(false);
    }
  };

  return (
    <div className="space-y-6 py-8 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-gray-900 mb-2">Tính phí</h1>
        <p className="text-gray-600">
          Nhập chỉ số công tơ, thiết lập phí dịch vụ và tính toán hóa đơn
        </p>
      </div>

      {/* CSV Format Info Card */}
      <Card className="shadow-lg border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Định dạng file CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-3">
            File CSV phải có định dạng như sau (bao gồm dòng header):
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <code className="text-sm text-gray-800">
              apartmentID,month,year,oldElectricity,newElectricity,oldWater,newWater
              <br />
              A101,12,2023,1000,1200,500,600
              <br />
              A102,12,2023,1500,1700,800,900
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Main Action Cards */}
      {/*<div className="grid grid-cols-5 gap-6">*/}
      <div className="grid grid-cols-1 gap-6">
        {/* Meter Reading Card */}
        <Card className="shadow-lg border-blue-200 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-3">
                <FileEdit className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-white">Chỉ số công tơ</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6 min-h-[48px]">
              Nhập chỉ số điện và nước cho các căn hộ bằng CSV hoặc thủ công
            </p>
            <Button
              onClick={handleOpenMeterReadingModal}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer"
            >
              <FileEdit className="w-5 h-5 mr-2 cursor-pointer" />
              Nhập chỉ số
            </Button>
          </CardContent>
        </Card>

        {/* Service Fee Card */}
        <Card className="shadow-lg border-green-200 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-white">Phí dịch vụ</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6 min-h-[48px]">
              Thiết lập phí dịch vụ cho các loại dịch vụ khác
            </p>
            <Button
              onClick={() => setShowServiceFeeModal(true)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 cursor-pointer"
            >
              <Plus className="w-5 h-5 mr-2" />
              Thêm phí dịch vụ
            </Button>
          </CardContent>
        </Card>

        {/* Delete Fee Card */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-3">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-white">Xóa phí</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6 min-h-[48px]">
              Xóa các loại phí dịch vụ khác
            </p>
            <Button
              onClick={() => setShowDeleteFeeModal(true)}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-800 hover:to-orange-700 cursor-pointer"
            >
              <Minus className="w-5 h-5 mr-2" />
              Xóa phí dịch vụ
            </Button>
          </CardContent>
        </Card>

        {/* Manual Bill Card */}
        <Card className="shadow-lg border-red-200 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-3">
                <Receipt className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-white">Hóa đơn thủ công</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6 min-h-[48px]">
              Tạo hóa đơn thủ công cho các căn hộ
            </p>
            <Button
              onClick={() => setShowManualBillModal(true)}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 cursor-pointer"
            >
              <Plus className="w-5 h-5 mr-2" />
              Tạo hóa đơn
            </Button>
          </CardContent>
        </Card>

        {/* Calculate Bills Card */}
        <Card className="shadow-lg border-purple-200 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-3">
                <Calculator className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-white">Tính hóa đơn</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6 min-h-[48px]">
              Tự động tính toán hóa đơn hàng tháng cho tất cả các căn hộ
            </p>
            <Button
              onClick={() => setShowCalculateModal(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 cursor-pointer"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Tính hóa đơn
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Meter Reading Modal */}
      <Dialog
        open={showMeterReadingModal}
        onOpenChange={setShowMeterReadingModal}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-blue-900 text-2xl">
              Nhập chỉ số công tơ
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Chọn phương thức nhập chỉ số điện và nước
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            {meterReadingMethod === null ? (
              // Method selection
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleMeterReadingMethodSelect("csv")}
                  className="flex flex-col items-center justify-center p-8 border-2 border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all group cursor-pointer"
                >
                  <div className="bg-blue-100 rounded-full p-4 mb-4 group-hover:bg-blue-200 transition-colors">
                    <FileUp className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Nhập từ CSV
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Tải lên file CSV với nhiều chỉ số cùng lúc
                  </p>
                </button>

                <button
                  onClick={() => handleMeterReadingMethodSelect("manual")}
                  className="flex flex-col items-center justify-center p-8 border-2 border-green-300 rounded-lg hover:bg-green-50 hover:border-green-500 transition-all group cursor-pointer"
                >
                  <div className="bg-green-100 rounded-full p-4 mb-4 group-hover:bg-green-200 transition-colors">
                    <FileEdit className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Nhập thủ công
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Nhập chỉ số cho từng căn hộ
                  </p>
                </button>
              </div>
            ) : meterReadingMethod === "csv" ? (
              // CSV upload
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="csv-file"
                    className="text-gray-700 mb-2 block"
                  >
                    Chọn file CSV
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleCSVFileChange}
                      className="flex-1 cursor-pointer"
                    />
                    {csvFile && (
                      <Badge className="bg-green-500">{csvFile.name}</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setMeterReadingMethod(null)}
                    variant="outline"
                    className="flex-1 cursor-pointer"
                  >
                    Quay lại
                  </Button>
                  <Button
                    onClick={handleCSVUpload}
                    disabled={!csvFile || processingMeterReading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    {processingMeterReading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Tải lên
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              // Manual input form
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="apartment"
                      className="text-gray-700 mb-2 block"
                    >
                      Căn hộ *
                    </Label>
                    <Select
                      value={meterReading.apartmentID}
                      onValueChange={(value) =>
                        setMeterReading({ ...meterReading, apartmentID: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn căn hộ" />
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label
                        htmlFor="month"
                        className="text-gray-700 mb-2 block"
                      >
                        Tháng *
                      </Label>
                      <Input
                        id="month"
                        type="number"
                        min="1"
                        max="12"
                        value={meterReading.month}
                        onChange={(e) =>
                          setMeterReading({
                            ...meterReading,
                            month: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="year"
                        className="text-gray-700 mb-2 block"
                      >
                        Năm *
                      </Label>
                      <Input
                        id="year"
                        type="number"
                        value={meterReading.year}
                        onChange={(e) =>
                          setMeterReading({
                            ...meterReading,
                            year: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Điện (kWh)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="oldElectricity"
                        className="text-gray-700 mb-2 block"
                      >
                        Chỉ số cũ
                      </Label>
                      <Input
                        id="oldElectricity"
                        type="number"
                        step="0.01"
                        value={meterReading.oldElectricity}
                        onChange={(e) =>
                          setMeterReading({
                            ...meterReading,
                            oldElectricity: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="newElectricity"
                        className="text-gray-700 mb-2 block"
                      >
                        Chỉ số mới
                      </Label>
                      <Input
                        id="newElectricity"
                        type="number"
                        step="0.01"
                        value={meterReading.newElectricity}
                        onChange={(e) =>
                          setMeterReading({
                            ...meterReading,
                            newElectricity: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Nước (m³)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="oldWater"
                        className="text-gray-700 mb-2 block"
                      >
                        Chỉ số cũ
                      </Label>
                      <Input
                        id="oldWater"
                        type="number"
                        step="0.01"
                        value={meterReading.oldWater}
                        onChange={(e) =>
                          setMeterReading({
                            ...meterReading,
                            oldWater: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="newWater"
                        className="text-gray-700 mb-2 block"
                      >
                        Chỉ số mới
                      </Label>
                      <Input
                        id="newWater"
                        type="number"
                        step="0.01"
                        value={meterReading.newWater}
                        onChange={(e) =>
                          setMeterReading({
                            ...meterReading,
                            newWater: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setMeterReadingMethod(null)}
                    variant="outline"
                    className="flex-1 cursor-pointer"
                  >
                    Quay lại
                  </Button>
                  <Button
                    onClick={handleManualMeterReadingSubmit}
                    disabled={processingMeterReading}
                    className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
                  >
                    {processingMeterReading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu chỉ số"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Fee Modal */}
      <Dialog open={showServiceFeeModal} onOpenChange={setShowServiceFeeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-green-900 text-2xl">
              Thiết lập phí dịch vụ
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Nhập thông tin phí dịch vụ cho tòa nhà
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div>
              <Label htmlFor="buildingID" className="text-gray-700 mb-2 block">
                Mã tòa nhà *
              </Label>
              <Input
                id="buildingID"
                type="text"
                placeholder="VD: A, B, C"
                value={serviceFee.buildingID}
                onChange={(e) =>
                  setServiceFee({ ...serviceFee, buildingID: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="serviceName" className="text-gray-700 mb-2 block">
                Loại phí *
              </Label>
              <Select
                value={serviceFee.serviceName}
                onValueChange={(value) => {
                  setServiceFee({ ...serviceFee, serviceName: value });
                }}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Management">
                    Quản lý (Management)
                  </SelectItem>
                  <SelectItem value="Parking">Gửi xe (Parking)</SelectItem>
                  <SelectItem value="Internet">Internet</SelectItem>
                  <SelectItem value="Other">Khác (Other)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show custom bill type input when "Other" is selected */}
            {serviceFee.serviceName === "Other" && (
              <div>
                <Label
                  htmlFor="otherBillType"
                  className="text-gray-700 mb-2 block"
                >
                  Tên loại phí *
                </Label>
                <Input
                  id="otherBillType"
                  type="text"
                  placeholder="VD: Phí bảo trì thang máy, Phí vệ sinh..."
                  value={otherBillType}
                  onChange={(e) => setOtherBillType(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nhập tên cụ thể cho loại phí này
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="flatFee" className="text-gray-700 mb-2 block">
                Đơn giá (₫) *
              </Label>
              <Input
                id="flatFee"
                type="number"
                min="0"
                step="1"
                placeholder="VD: 100000"
                value={serviceFee.unitPrice || 0}
                onChange={(e) =>
                  setServiceFee({
                    ...serviceFee,
                    unitPrice: e.target.value ? parseInt(e.target.value) : 0,
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Phí cố định hàng tháng cho mỗi căn hộ
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowServiceFeeModal(false)}
                variant="outline"
                className="flex-1 cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                onClick={handleServiceFeeSubmit}
                disabled={processingServiceFee}
                className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
              >
                {processingServiceFee ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu phí dịch vụ"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Fee Modal */}
      <Dialog open={showDeleteFeeModal} onOpenChange={setShowDeleteFeeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-red-900 text-2xl">
              Xóa phí dịch vụ
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Nhập thông tin phí dịch vụ
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div>
              <Label htmlFor="buildingID" className="text-gray-700 mb-2 block">
                Mã tòa nhà *
              </Label>
              <Input
                id="buildingID"
                type="text"
                placeholder="VD: A, B, C"
                value={deleteFee.buildingID}
                onChange={(e) =>
                  setDeleteFee({ ...deleteFee, buildingID: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="serviceName" className="text-gray-700 mb-2 block">
                Loại phí *
              </Label>
              <Select
                value={deleteFee.serviceName}
                onValueChange={(value) => {
                  setDeleteFee({ ...deleteFee, serviceName: value });
                }}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Management">
                    Quản lý (Management)
                  </SelectItem>
                  <SelectItem value="Parking">Gửi xe (Parking)</SelectItem>
                  <SelectItem value="Internet">Internet</SelectItem>
                  <SelectItem value="Other">Khác (Other)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show custom bill type input when "Other" is selected */}
            {serviceFee.serviceName === "Other" && (
              <div>
                <Label
                  htmlFor="otherBillTypeDelete"
                  className="text-gray-700 mb-2 block"
                >
                  Tên loại phí *
                </Label>
                <Input
                  id="otherBillTypeDelete"
                  type="text"
                  placeholder="VD: Phí bảo trì thang máy, Phí vệ sinh..."
                  value={otherBillTypeDelete}
                  onChange={(e) => setOtherBillTypeDelete(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nhập tên cụ thể cho loại phí này
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowDeleteFeeModal(false)}
                variant="outline"
                className="flex-1 cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                onClick={handleServiceFeeDelete}
                disabled={deletingServiceFee}
                className="flex-1 bg-yellow-600 hover:bg-yellow-800 cursor-pointer"
              >
                {deletingServiceFee ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa phí dịch vụ"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Bill Modal */}
      <Dialog open={showManualBillModal} onOpenChange={setShowManualBillModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-red-900 text-2xl">
              Tạo hóa đơn thủ công
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Nhập thông tin hóa đơn thủ công cho căn hộ
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div>
              <Label htmlFor="apartmentID" className="text-gray-700 mb-2 block">
                Căn hộ *
              </Label>
              <Select
                value={manualBill.apartmentID}
                onValueChange={(value) =>
                  setManualBill({ ...manualBill, apartmentID: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn căn hộ" />
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

            <div>
              <Label htmlFor="deadline" className="text-gray-700 mb-2 block">
                Ngày hạn thanh toán *
              </Label>
              <Input
                id="deadline"
                type="date"
                value={manualBill.deadline}
                onChange={(e) =>
                  setManualBill({ ...manualBill, deadline: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="typeOfBill" className="text-gray-700 mb-2 block">
                Tên dịch vụ *
              </Label>
              <Input
                id="typeOfBill"
                type="text"
                placeholder="VD: Phí bảo trì thang máy, Phí vệ sinh..."
                value={manualBill.typeOfBill}
                onChange={(e) => {
                  setManualBill({ ...manualBill, typeOfBill: e.target.value });
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Nhập tên cụ thể cho loại phí này
              </p>
            </div>

            <div>
              <Label htmlFor="total" className="text-gray-700 mb-2 block">
                Thành tiền (₫) *
              </Label>
              <Input
                id="total"
                type="number"
                min="0"
                step="1"
                placeholder="VD: 15000"
                value={manualBill.amount || 0}
                onChange={(e) =>
                  setManualBill({
                    ...manualBill,
                    amount: e.target.value ? parseInt(e.target.value) : 0,
                  })
                }
              />

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowManualBillModal(false)}
                  variant="outline"
                  className="flex-1 cursor-pointer"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleManualBillSubmit}
                  disabled={processingManualBill}
                  className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
                >
                  {processingManualBill ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu hóa đơn"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Calculate Bills Modal */}
      <Dialog open={showCalculateModal} onOpenChange={setShowCalculateModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-purple-900 text-2xl">
              Tính hóa đơn tháng
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Tự động tính toán hóa đơn cho tất cả căn hộ
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="calc-month"
                  className="text-gray-700 mb-2 block"
                >
                  Tháng *
                </Label>
                <Select
                  value={calculateRequest.month.toString()}
                  onValueChange={(value) =>
                    setCalculateRequest({
                      ...calculateRequest,
                      month: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <SelectItem key={month} value={month.toString()}>
                          Tháng {month}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="calc-year" className="text-gray-700 mb-2 block">
                  Năm *
                </Label>
                <Input
                  id="calc-year"
                  type="number"
                  value={calculateRequest.year}
                  onChange={(e) =>
                    setCalculateRequest({
                      ...calculateRequest,
                      year: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="deadline-day"
                className="text-gray-700 mb-2 block"
              >
                Ngày hạn thanh toán
              </Label>
              <Input
                id="deadline-day"
                type="number"
                min="1"
                max="20"
                value={calculateRequest.deadline_day || ""}
                onChange={(e) =>
                  setCalculateRequest({
                    ...calculateRequest,
                    deadline_day: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="VD: 10 (ngày 10 hàng tháng)"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="overwrite"
                checked={calculateRequest.overwrite}
                onChange={(e) =>
                  setCalculateRequest({
                    ...calculateRequest,
                    overwrite: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-purple-600"
              />
              <Label
                htmlFor="overwrite"
                className="text-gray-700 cursor-pointer"
              >
                Ghi đè hóa đơn đã tồn tại
              </Label>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Hệ thống sẽ tính toán hóa đơn cho tất cả
                các căn hộ dựa trên chỉ số công tơ và phí dịch vụ đã thiết lập.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowCalculateModal(false)}
                variant="outline"
                className="flex-1 cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                onClick={handleCalculateBills}
                disabled={processingCalculation}
                className="flex-1 bg-purple-600 hover:bg-purple-700 cursor-pointer"
              >
                {processingCalculation ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Đang tính...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Tính hóa đơn
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
