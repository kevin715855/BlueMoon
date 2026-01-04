import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Sidebar } from "../shared/Sidebar";
import { AdminOverviewTab } from "./AdminOverviewTab";
import { AccountManagementTab } from "./AccountManagementTab";
import { ResidentManagementTab } from "./ResidentManagementTab";
import { ApartmentManagementTab } from "./ApartmentManagementTab";
import { BuildingManagersTab } from "./BuildingManagersTab";
import { AccountantsTab } from "./AccountantsTab";
import { ReceiptManagementTab } from "./ReceiptManagementTab";
import { BuildingManagementTab } from "./BuildingManagementTab";
import { OfflinePaymentsTab } from "./OfflinePaymentsTab";
import { AccountingTab } from "./AccountingTab";

function InfoTab() {
  return (
    <Card className="shadow-lg border-blue-201">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="py-3 text-white">
          Chào mừng đến với hệ thống BlueMoon
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-601">
          Sử dụng menu bên trái để quản lý các chức năng của hệ thống.
        </p>
      </CardContent>
    </Card>
  );
}

interface AdminDashboardProps {
  username: string;
  role: string;
  onLogout: () => void;
}

export function AdminDashboard({
  username,
  role,
  onLogout,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar
        role={role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />

      <div className="flex-1 overflow-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
          <h2 className="text-white">Xin chào, {username}</h2>
          <p className="text-blue-100">Bảng điều khiển {role}</p>
        </div>

        <div className="p-8">
          {activeTab === "dashboard" &&
            (role === "Accountant" ? (
              <InfoTab />
            ) : (
              <AdminOverviewTab role={role} />
            ))}
          {activeTab === "accounts" && <AccountManagementTab role={role} />}
          {activeTab === "residents" && <ResidentManagementTab role={role} />}
          {activeTab === "apartments" && <ApartmentManagementTab role={role} />}
          {activeTab === "buildings" && <BuildingManagementTab role={role} />}
          {activeTab === "building-managers" && (
            <BuildingManagersTab role={role} />
          )}
          {activeTab === "accountants" && <AccountantsTab role={role} />}
          {activeTab === "receipts" && <ReceiptManagementTab role={role} />}
          {activeTab === "offline-payments" && (
            <OfflinePaymentsTab role={role} />
          )}
          {activeTab === "accounting" && <AccountingTab role={role} />}
        </div>
      </div>
    </div>
  );
}
