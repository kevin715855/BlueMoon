import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  additionalInfo?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor,
  iconColor,
  additionalInfo,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-gray-600 mb-1">{title}</p>
          <p className="text-gray-900">{value}</p>
          {additionalInfo && <div className="mt-2">{additionalInfo}</div>}
          <p className="text-gray-500 mt-2">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
