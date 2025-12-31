import { DashboardStats } from './DashboardStats';
import { RecentResidentsList } from './RecentResidentsList';
import { ApartmentStatusList } from './ApartmentStatusList';
import type { Apartment, Resident } from '../../services/api';

interface DashboardTabProps {
  apartments: Apartment[];
  residents: Resident[];
}

export function DashboardTab({ apartments, residents }: DashboardTabProps) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of your apartment management</p>
      </div>

      <DashboardStats apartments={apartments} residents={residents} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-gray-900 mb-6">Recent Residents</h3>
          <RecentResidentsList residents={residents} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-gray-900 mb-6">Apartment Status</h3>
          <ApartmentStatusList apartments={apartments} residents={residents} />
        </div>
      </div>
    </>
  );
}
