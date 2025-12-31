import { EmptyState } from '../shared/EmptyState';

export function PaymentsTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Payment Management</h2>
        <p className="text-gray-600">Manage all resident payments</p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm">
        <EmptyState
          message="Payment management will be integrated with the backend API."
          icon="💳"
        />
      </div>
    </div>
  );
}
