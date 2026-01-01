import { useState } from "react";
import { Sidebar } from "../shared/Sidebar";
import { ResidentBillsTab } from "./ResidentBillsTab";
import { ResidentPaymentsTab } from "./ResidentPaymentsTab";
import { ResidentOverviewTab } from "./ResidentOverviewTab";

interface ResidentDashboardProps {
  username: string;
  role: string;
  onLogout: () => void;
}

export function ResidentDashboard({ username, role, onLogout }: ResidentDashboardProps) {
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
          <h2 className="text-white">
            Xin chào, {username}
          </h2>
          <p className="text-blue-100">Chào mừng bạn đến với hệ thống BlueMoon</p>
        </div>

        <div className="p-8">
          {activeTab === "dashboard" && <ResidentOverviewTab />}
          {activeTab === "bills" && <ResidentBillsTab />}
          {activeTab === "payments" && <ResidentPaymentsTab />}
        </div>
      </div>
    </div>
  );
}
