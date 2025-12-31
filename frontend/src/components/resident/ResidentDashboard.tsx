import { useState } from "react";
import { Building2, Bell, CreditCard, LayoutDashboard } from "lucide-react";
import { DashboardHeader } from "../shared/DashboardHeader";
import { ResidentDashboardTab } from "./ResidentDashboardTab";
import { ResidentPaymentsTab } from "./ResidentPaymentsTab";
import { ResidentNotificationsTab } from "./ResidentNotificationsTab";

type TabType = "dashboard" | "payments" | "notifications";

interface ResidentDashboardProps {
  username: string;
  role: string;
  onLogout: () => void;
}

export function ResidentDashboard({ username, onLogout }: ResidentDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const unreadCount = 0; // Will be loaded from backend

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadCount },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-600 min-h-screen p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white">BlueMoon</span>
        </div>

        <nav className="flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors relative ${
                  isActive
                    ? "bg-indigo-500 text-white"
                    : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <DashboardHeader
          username={username}
          role="Resident"
          subtitle="Manage your apartment"
          notificationCount={unreadCount}
          onLogout={onLogout}
        />

        <main className="p-8">
          {activeTab === "dashboard" && <ResidentDashboardTab />}
          {activeTab === "payments" && <ResidentPaymentsTab />}
          {activeTab === "notifications" && <ResidentNotificationsTab />}
        </main>
      </div>
    </div>
  );
}
