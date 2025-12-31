import { useState } from 'react';
import { Sidebar } from '../Sidebar';
import { DashboardHeader } from '../shared/DashboardHeader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { DashboardTab } from './DashboardTab';
import { ResidentsTab } from './ResidentsTab';
import { ApartmentsTab } from './ApartmentsTab';
import { PaymentsTab } from './PaymentsTab';
import { NotificationsTab } from './NotificationsTab';
import { AdminTab } from './AdminTab';
import type { Apartment, Resident } from '../../services/api';

type TabType = 'dashboard' | 'apartments' | 'residents' | 'payments' | 'notifications' | 'admin';

interface AdminDashboardProps {
  username: string;
  role: string;
  apartments: Apartment[];
  residents: Resident[];
  onLogout: () => void;
  apartmentsLoading?: boolean;
  residentsLoading?: boolean;
}

export function AdminDashboard({
  username,
  role,
  apartments,
  residents,
  onLogout,
  apartmentsLoading = false,
  residentsLoading = false,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const unreadNotifications = 0; // Will be loaded from backend
  const isLoading = apartmentsLoading || residentsLoading;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        notificationCount={unreadNotifications}
      />

      <div className="flex-1">
        <DashboardHeader
          username={username}
          role={role}
          subtitle="Manage your properties efficiently"
          notificationCount={unreadNotifications}
          onLogout={onLogout}
        />

        <main className="p-8">
          {activeTab === 'dashboard' && (
            <>
              {isLoading ? (
                <LoadingSpinner message="Loading dashboard data..." />
              ) : (
                <DashboardTab apartments={apartments} residents={residents} />
              )}
            </>
          )}

          {activeTab === 'residents' && (
            <ResidentsTab residents={residents} loading={residentsLoading} />
          )}

          {activeTab === 'apartments' && (
            <ApartmentsTab
              apartments={apartments}
              residents={residents}
              loading={apartmentsLoading}
            />
          )}

          {activeTab === 'payments' && <PaymentsTab />}

          {activeTab === 'notifications' && <NotificationsTab />}

          {activeTab === 'admin' && <AdminTab />}
        </main>
      </div>
    </div>
  );
}
