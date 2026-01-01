import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import { api, type Bill } from "../../services/api";
import { LoadingSpinner } from "../shared/LoadingSpinner";

export function ResidentBillsTab() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const data = await api.bills.getMyBills();
      setBills(data);
    } catch (error) {
      console.error("Failed to load bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <Badge className="bg-green-500 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Đã thanh toán
          </Badge>
        );
      case "Unpaid":
        return (
          <Badge className="bg-yellow-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Chưa thanh toán
          </Badge>
        );
      case "Overdue":
        return (
          <Badge className="bg-red-500 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Quá hạn
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
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-white">Danh sách hóa đơn của tôi</CardTitle>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">Không có hóa đơn nào</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead className="text-blue-900">Mã hóa đơn</TableHead>
                <TableHead className="text-blue-900">Loại hóa đơn</TableHead>
                <TableHead className="text-blue-900">Ngày tạo</TableHead>
                <TableHead className="text-blue-900">Hạn thanh toán</TableHead>
                <TableHead className="text-blue-900">Số tiền</TableHead>
                <TableHead className="text-blue-900">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.billID}>
                  <TableCell>#{bill.billID}</TableCell>
                  <TableCell>{bill.typeOfBill || "N/A"}</TableCell>
                  <TableCell>
                    {bill.createDate
                      ? new Date(bill.createDate).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {bill.deadline
                      ? new Date(bill.deadline).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {(bill.total || 0).toLocaleString("vi-VN")} ₫
                  </TableCell>
                  <TableCell>{getStatusBadge(bill.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
