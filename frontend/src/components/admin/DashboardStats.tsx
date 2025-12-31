import { Building2, Users, DollarSign, Home } from 'lucide-react';
import { StatCard } from '../shared/StatCard';
import { calculateOccupancy } from '../../utils/calculations';
import { formatPercentage } from '../../utils/formatters';
import type { Apartment, Resident } from '../../services/api';

interface DashboardStatsProps {
  apartments: Apartment[];
  residents: Resident[];
}

export function DashboardStats({ apartments, residents }: DashboardStatsProps) {
  const { totalApartments, occupiedApartments, vacantApartments, occupancyRate } =
    calculateOccupancy(apartments, residents);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Apartments"
        value={totalApartments}
        subtitle={`${occupiedApartments} Occupied, ${vacantApartments} Vacant`}
        icon={Building2}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        additionalInfo={
          <div className="flex gap-3">
            <span className="text-green-600">{occupiedApartments} Occupied</span>
            <span className="text-gray-500">{vacantApartments} Vacant</span>
          </div>
        }
      />

      <StatCard
        title="Active Residents"
        value={residents.length}
        subtitle="Across all properties"
        icon={Users}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
      />

      <StatCard
        title="Monthly Revenue"
        value="$0"
        subtitle="No data yet"
        icon={DollarSign}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
      />

      <StatCard
        title="Occupancy Rate"
        value={formatPercentage(occupancyRate)}
        subtitle={`${occupiedApartments} of ${totalApartments} occupied`}
        icon={Home}
        iconBgColor="bg-orange-100"
        iconColor="text-orange-600"
        additionalInfo={
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full"
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
        }
      />
    </div>
  );
}
