interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ message = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="text-center py-12">
      <div
        className={`${sizeClasses[size]} border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4`}
      ></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
