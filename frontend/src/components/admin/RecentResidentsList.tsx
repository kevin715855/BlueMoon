import { EmptyState } from '../shared/EmptyState';
import { getResidentTypeBadgeClass, getResidentTypeLabel } from '../../utils/styles';
import type { Resident } from '../../services/api';

interface RecentResidentsListProps {
  residents: Resident[];
  maxItems?: number;
}

export function RecentResidentsList({ residents, maxItems = 5 }: RecentResidentsListProps) {
  const recentResidents = residents.slice(0, maxItems);

  if (recentResidents.length === 0) {
    return <EmptyState message="No residents yet" icon="👥" />;
  }

  return (
    <div className="space-y-4">
      {recentResidents.map((resident) => (
        <div
          key={resident.residentID}
          className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0"
        >
          <div>
            <p className="text-gray-900 mb-1">{resident.fullName}</p>
            <p className="text-gray-600">
              {resident.apartmentID
                ? `Apartment ${resident.apartmentID}`
                : 'No apartment assigned'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs ${getResidentTypeBadgeClass(resident.isOwner)}`}>
            {getResidentTypeLabel(resident.isOwner)}
          </span>
        </div>
      ))}
    </div>
  );
}
