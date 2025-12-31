import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { getResidentTypeBadgeClass, getResidentTypeLabel } from '../../utils/styles';
import { formatPhoneNumber } from '../../utils/formatters';
import type { Resident } from '../../services/api';

interface ResidentsTabProps {
  residents: Resident[];
  loading?: boolean;
}

export function ResidentsTab({ residents, loading = false }: ResidentsTabProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Residents</h2>
        <p className="text-gray-600">Manage all residents</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm">
          <LoadingSpinner message="Loading residents..." />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-700">Name</th>
                  <th className="text-left py-4 px-6 text-gray-700">Apartment</th>
                  <th className="text-left py-4 px-6 text-gray-700">Phone</th>
                  <th className="text-left py-4 px-6 text-gray-700">Type</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((resident) => (
                  <tr key={resident.residentID} className="border-t border-gray-100">
                    <td className="py-4 px-6 text-gray-900">{resident.fullName}</td>
                    <td className="py-4 px-6 text-gray-900">
                      {resident.apartmentID || 'Not assigned'}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {formatPhoneNumber(resident.phoneNumber)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs ${getResidentTypeBadgeClass(resident.isOwner)}`}
                      >
                        {getResidentTypeLabel(resident.isOwner)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {residents.length === 0 && (
              <div className="p-8">
                <EmptyState message="No residents found" icon="👥" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
