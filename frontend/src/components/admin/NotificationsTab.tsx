import { EmptyState } from '../shared/EmptyState';

export function NotificationsTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Notifications</h2>
        <p className="text-gray-600">Send notifications to residents</p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm">
        <EmptyState
          message="Notification system will be integrated with the backend API."
          icon="🔔"
        />
      </div>
    </div>
  );
}
