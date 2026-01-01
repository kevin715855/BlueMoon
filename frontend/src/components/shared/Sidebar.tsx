import { Home, FileText, CreditCard, Building, Users, UserCog, ClipboardList, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Permissions, type UserRole } from "../../utils/permissions";

interface SidebarProps {
  role: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export function Sidebar({ role, activeTab, onTabChange, onLogout }: SidebarProps) {
  const userRole = role as UserRole;

  const getMenuItems = () => {
    const items = [];

    // Dashboard - available to all
    items.push({ id: "dashboard", label: "Tổng quan", icon: Home });

    // Resident-specific menu
    if (Permissions.canViewMyBills(userRole)) {
      items.push({ id: "bills", label: "Hóa đơn", icon: FileText });
    }

    if (Permissions.canViewMyPayments(userRole)) {
      items.push({ id: "payments", label: "Thanh toán", icon: CreditCard });
    }

    // Accountant-specific menu
    if (Permissions.canManageOfflinePayments(userRole) && userRole === "Accountant") {
      items.push({ id: "offline-payments", label: "Thanh toán offline", icon: CreditCard });
    }

    // Manager/Admin menu items
    if (Permissions.canManageAccounts(userRole)) {
      items.push({ id: "accounts", label: "Tài khoản", icon: UserCog });
    }

    if (Permissions.canManageResidents(userRole)) {
      items.push({ id: "residents", label: "Cư dân", icon: Users });
    }

    if (Permissions.canViewApartments(userRole)) {
      items.push({ id: "apartments", label: "Căn hộ", icon: Building });
    }

    if (Permissions.canManageBuildingManagers(userRole)) {
      items.push({ id: "building-managers", label: "Quản lý", icon: ClipboardList });
    }

    if (Permissions.canManageAccountants(userRole)) {
      items.push({ id: "accountants", label: "Kế toán", icon: ClipboardList });
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen flex flex-col shadow-xl">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-white">BlueMoon</h1>
        <p className="text-blue-200 text-sm mt-1">{role}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-blue-100 hover:bg-blue-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-700">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start gap-3 text-blue-100 hover:bg-blue-700 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
