import type { ReactNode } from 'react';
import { cn } from '../../utils/tailwind';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

const valueColors = {
  primary: 'text-[var(--n-primary)]',
  secondary: 'text-[var(--n-secondary)]',
  accent: 'text-[var(--n-accent)]',
};

export const MetricCard = ({
  label,
  value,
  unit,
  icon,
  variant = 'primary',
  className,
}: MetricCardProps) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 p-5 bg-[var(--n-bg-subtle)] rounded-[var(--n-radius-md)] min-w-[140px] animate-count-up',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)]">
          {label}
        </span>
        {icon && (
          <div className={cn('opacity-60', valueColors[variant])}>{icon}</div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn('text-[26px] font-semibold leading-none', valueColors[variant])}>
          {value}
        </span>
        {unit && (
          <span className="text-[13px] text-[var(--n-text-tertiary)] font-medium">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};
