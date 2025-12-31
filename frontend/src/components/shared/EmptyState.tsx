interface EmptyStateProps {
  message: string;
  icon?: string;
}

export function EmptyState({ message, icon = '📭' }: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-gray-600">
      <div className="text-4xl mb-2">{icon}</div>
      <p>{message}</p>
    </div>
  );
}
