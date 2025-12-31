import { Home, CreditCard, Check } from 'lucide-react';
import { StatCard } from '../shared/StatCard';

interface ResidentDashboardStatsProps {
  apartmentInfo?: string;
  pendingPayments: number;
  totalPaid: number;
}

export function ResidentDashboardStats({
  apartmentInfo = 'Loading...',
  pendingPayments,
  totalPaid,
}: ResidentDashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Your Apartment"
        value={apartmentInfo}
        subtitle="Fetching data..."
        icon={Home}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
      />

      <StatCard
        title="Pending Payments"
        value={pendingPayments}
        subtitle={pendingPayments > 0 ? 'Action required' : 'All caught up'}
        icon={CreditCard}
        iconBgColor="bg-yellow-100"
        iconColor="text-yellow-600"
      />

      <StatCard
        title="Total Paid"
        value={`$${totalPaid.toLocaleString()}`}
        subtitle="All time"
        icon={Check}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
      />
    </div>
  );
}
