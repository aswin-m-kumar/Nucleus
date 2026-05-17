import type { ReactNode } from 'react';
import { cn } from '../../utils/tailwind';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  heading?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon,
  heading = 'Nothing here yet',
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-8 text-center', className)}>
      <div className="mb-4 text-[var(--n-text-tertiary)] opacity-40">
        {icon || <Inbox size={48} strokeWidth={1.5} />}
      </div>
      <h3 className="text-[16px] font-medium text-[var(--n-text)] mb-1">
        {heading}
      </h3>
      {description && (
        <p className="text-[14px] text-[var(--n-text-tertiary)] max-w-xs mb-5">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
};
