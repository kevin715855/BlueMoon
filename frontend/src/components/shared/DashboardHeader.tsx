import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  username: string;
  role: string;
  subtitle: string;
  onLogout: () => void;
}

export function DashboardHeader({
  username,
  role,
  subtitle,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-1">Welcome back, {username}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600">👤</span>
              </div>
              <div>
                <p className="text-gray-900">{username}</p>
                <p className="text-gray-600">{role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
