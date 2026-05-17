import { cn } from '../../utils/tailwind';

interface ProgressBarProps {
  value: number;
  label?: string;
  variant?: 'completion' | 'weightage';
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar = ({
  value,
  label,
  variant = 'completion',
  showPercentage = true,
  className,
}: ProgressBarProps) => {
  const clamped = Math.min(Math.max(value, 0), 150); // allow visual overflow for >100
  const fillWidth = Math.min(clamped, 100);

  // Determine color based on variant and value
  let fillColor = 'bg-[var(--n-primary)]';
  if (variant === 'weightage') {
    if (value > 100) fillColor = 'bg-[var(--n-danger)]';
    else if (value === 100) fillColor = 'bg-[var(--n-status-approved)]';
    else if (value > 90) fillColor = 'bg-[var(--n-secondary)]';
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)]">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-[13px] font-semibold text-[var(--n-text-secondary)]">
              {value}% allocated
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full bg-[var(--n-bg-muted)] rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', fillColor)}
          style={{ width: `${fillWidth}%` }}
        />
      </div>
    </div>
  );
};
