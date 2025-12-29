import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { getOccupancyStatus } from '../../utils/calculations';
import { getStatusBadgeClass } from '../../utils/styles';
import { formatArea } from '../../utils/formatters';
import type { Apartment, Resident } from '../../services/api';

interface ApartmentsTabProps {
  apartments: Apartment[];
  residents: Resident[];
  loading?: boolean;
}

export function ApartmentsTab({ apartments, residents, loading = false }: ApartmentsTabProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Apartments</h2>
        <p className="text-gray-600">View all apartment units</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm">
          <LoadingSpinner message="Loading apartments..." />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-700">Apartment ID</th>
                  <th className="text-left py-4 px-6 text-gray-700">Area</th>
                  <th className="text-left py-4 px-6 text-gray-700">Building</th>
                  <th className="text-left py-4 px-6 text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {apartments.map((apartment) => {
                  const status = getOccupancyStatus(apartment.apartmentID, residents);

                  return (
                    <tr key={apartment.apartmentID} className="border-t border-gray-100">
                      <td className="py-4 px-6 text-gray-900">{apartment.apartmentID}</td>
                      <td className="py-4 px-6 text-gray-900">{formatArea(apartment.area)}</td>
                      <td className="py-4 px-6 text-gray-600">
                        {apartment.buildingID || 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-lg text-xs ${getStatusBadgeClass(status)}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {apartments.length === 0 && (
              <div className="p-8">
                <EmptyState message="No apartments found" icon="🏢" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
