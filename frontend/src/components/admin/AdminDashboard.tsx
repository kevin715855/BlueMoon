import { useState } from "react";
import { Sidebar } from "../Sidebar";
import { DashboardHeader } from "../shared/DashboardHeader";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { DashboardTab } from "./DashboardTab";
import { ResidentsTab } from "./ResidentsTab";
import { ApartmentsTab } from "./ApartmentsTab";
import { PaymentsTab } from "./PaymentsTab";
import { AdminTab } from "./AdminTab";
import { useApartments } from "../../hooks/useApartments";
import { useResidents } from "../../hooks/useResidents";

type TabType = "dashboard" | "apartments" | "residents" | "payments" | "admin";

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
  const { apartments, loading: apartmentsLoading, error: apartmentsError } = useApartments();
  const { residents, loading: residentsLoading, error: residentsError } = useResidents();

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  const isLoading = apartmentsLoading || residentsLoading;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
      />

      <div className="flex-1">
        <DashboardHeader
          username={username}
          role={role}
          subtitle="Manage your properties efficiently"
          onLogout={onLogout}
        />

        <main className="p-8">
          {activeTab === "dashboard" && (
            <>
              {isLoading ? (
                <LoadingSpinner message="Loading dashboard data..." />
              ) : (
                <DashboardTab apartments={apartments} residents={residents} />
              )}
            </>
          )}

          {activeTab === "apartments" && (
            <ApartmentsTab
              apartments={apartments}
              residents={residents}
              loading={apartmentsLoading}
            />
          )}

          {activeTab === "residents" && (
            <ResidentsTab residents={residents} loading={residentsLoading} />
          )}

          {activeTab === "payments" && <PaymentsTab />}

          {activeTab === "admin" && <AdminTab />}
        </main>
      </div>
    </div>
  );
}
