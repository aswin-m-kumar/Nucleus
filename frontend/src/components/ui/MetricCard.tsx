import React from 'react';
import { cn } from '../../utils/tailwind';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const MetricCard = ({
  label,
  value,
  unit,
  icon,
  className = '',
}: MetricCardProps) => {
  return (
    <div className={cn(
      'flex flex-col gap-1 p-4 bg-[#f4f6f8] rounded-[12px] min-w-[140px]',
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-gray-500 font-medium">{label}</span>
        {icon && <div className="text-[#1D9E75]">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[#1D9E75]">{value}</span>
        {unit && <span className="text-[12px] text-gray-400 font-medium">{unit}</span>}
      </div>
    </div>
  );
};
