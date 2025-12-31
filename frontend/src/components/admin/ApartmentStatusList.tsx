import { EmptyState } from '../shared/EmptyState';
import { findResidentForApartment, getOccupancyStatus } from '../../utils/calculations';
import { getStatusBadgeClass } from '../../utils/styles';
import { formatArea } from '../../utils/formatters';
import type { Apartment, Resident } from '../../services/api';

interface ApartmentStatusListProps {
  apartments: Apartment[];
  residents: Resident[];
  maxItems?: number;
}

export function ApartmentStatusList({
  apartments,
  residents,
  maxItems = 5,
}: ApartmentStatusListProps) {
  const recentApartments = apartments.slice(0, maxItems);

  if (recentApartments.length === 0) {
    return <EmptyState message="No apartments yet" icon="🏢" />;
  }

  return (
    <div className="space-y-4">
      {recentApartments.map((apartment) => {
        const resident = findResidentForApartment(apartment.apartmentID, residents);
        const status = getOccupancyStatus(apartment.apartmentID, residents);

        return (
          <div
            key={apartment.apartmentID}
            className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0"
          >
            <div>
              <p className="text-gray-900 mb-1">Apartment {apartment.apartmentID}</p>
              <p className="text-gray-600">{formatArea(apartment.area)}</p>
            </div>
            <div className="flex items-center gap-3">
              {resident && <span className="text-gray-600">{resident.fullName}</span>}
              <span className={`px-3 py-1 rounded-lg text-xs ${getStatusBadgeClass(status)}`}>
                {status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
