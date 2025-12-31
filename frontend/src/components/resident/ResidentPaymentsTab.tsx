import { EmptyState } from '../shared/EmptyState';

export function ResidentPaymentsTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Payments</h2>
        <p className="text-gray-600">Manage your rent payments</p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm">
        <EmptyState
          message="No payments found. Connect to backend to load payment data."
          icon="💳"
        />
      </div>
    </div>
  );
}
