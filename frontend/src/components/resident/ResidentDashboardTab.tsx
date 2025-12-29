import { ResidentDashboardStats } from './ResidentDashboardStats';
import { EmptyState } from '../shared/EmptyState';

export function ResidentDashboardTab() {
  // Mock data - will be replaced with API calls
  const pendingPayments = 0;
  const totalPaid = 0;

  return (
    <>
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of your apartment</p>
      </div>

      <ResidentDashboardStats
        pendingPayments={pendingPayments}
        totalPaid={totalPaid}
      />

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-gray-900 mb-6">Recent Activity</h3>
        <EmptyState message="No recent activity. Data will be loaded from the backend." />
      </div>
    </>
  );
}
