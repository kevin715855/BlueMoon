import { EmptyState } from '../shared/EmptyState';

export function AdminTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Admin Settings</h2>
        <p className="text-gray-600">System administration</p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm">
        <EmptyState message="Admin settings will be added soon." icon="⚙️" />
      </div>
    </div>
  );
}
