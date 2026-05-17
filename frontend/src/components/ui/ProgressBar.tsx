import { cn } from '../../utils/tailwind';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  variant?: 'weightage' | 'completion';
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar = ({
  value,
  label,
  showPercentage = true,
  className = '',
}: ProgressBarProps) => {
  const getStatusColor = () => {
    if (value > 100) return 'bg-red-500';
    if (value === 100) return 'bg-green-500';
    if (value < 100) return 'bg-[#BA7517]';
    return 'bg-[#1D9E75]';
  };

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      <div className="flex justify-between items-center text-[12px] font-medium text-gray-600">
        {label && <span>{label}</span>}
        {showPercentage && <span>{value}%</span>}
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500 ease-out', getStatusColor())}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
};
