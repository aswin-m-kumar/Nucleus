import type { ReactNode } from 'react';
import { cn } from '../../utils/tailwind';

type BadgeVariant = 'approved' | 'submitted' | 'draft' | 'returned' | 'completed' | 'on-track' | 'not-started';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  approved:     'bg-[var(--n-status-approved-bg)] text-[var(--n-status-approved)]',
  completed:    'bg-[var(--n-status-approved-bg)] text-[var(--n-status-approved)]',
  'on-track':   'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  submitted:    'bg-[var(--n-status-submitted-bg)] text-[var(--n-status-submitted)]',
  draft:        'bg-[var(--n-status-draft-bg)] text-[var(--n-status-draft)]',
  returned:     'bg-[var(--n-status-returned-bg)] text-[var(--n-status-returned)]',
  'not-started':'bg-[var(--n-status-draft-bg)] text-[var(--n-status-draft)]',
};

export const Badge = ({ variant = 'draft', children, className, pulse }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium capitalize select-none',
        variantStyles[variant],
        pulse && 'animate-pulse-subtle',
        className
      )}
    >
      {children}
    </span>
  );
};
