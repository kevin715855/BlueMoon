import { EmptyState } from '../shared/EmptyState';

export function ResidentNotificationsTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Notifications</h2>
        <p className="text-gray-600">Your recent notifications</p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm">
        <EmptyState
          message="No notifications. Connect to backend to load notifications."
          icon="🔔"
        />
      </div>
    </div>
  );
}
