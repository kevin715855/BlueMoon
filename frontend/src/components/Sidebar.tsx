import { Building2, LayoutDashboard, Home, Users, CreditCard, Bell, Shield } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  notificationCount?: number;
}

export function Sidebar({ activeTab, onTabChange, notificationCount = 0 }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'apartments', label: 'Apartments', icon: Home },
    { id: 'residents', label: 'Residents', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notificationCount },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  return (
    <div className="w-64 bg-indigo-600 min-h-screen p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <span className="text-white">BlueMoon</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors relative ${
                isActive
                  ? 'bg-indigo-500 text-white'
                  : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}