import React from 'react';
import { cn } from '../../utils/tailwind';

type BadgeVariant = 'approved' | 'submitted' | 'draft' | 'returned' | 'on-track' | 'completed' | 'not-started';

interface BadgeProps {
  children: React.ReactNode;
  variant: BadgeVariant;
  className?: string;
}

export const Badge = ({
  children,
  variant,
  className = '',
}: BadgeProps) => {
  const variantStyles: Record<BadgeVariant, string> = {
    approved: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    submitted: 'bg-amber-100 text-amber-700',
    draft: 'bg-gray-100 text-gray-600',
    returned: 'bg-red-100 text-red-700',
    'on-track': 'bg-teal-100 text-teal-700',
    'not-started': 'bg-gray-100 text-gray-400',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-[6px] text-[12px] font-medium uppercase tracking-wider',
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  );
};
