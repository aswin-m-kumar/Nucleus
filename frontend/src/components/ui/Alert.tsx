import type { ReactNode } from 'react';
import { cn } from '../../utils/tailwind';
import { Info, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  type?: AlertType;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const alertStyles: Record<AlertType, { bg: string; border: string; icon: string }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
  },
  success: {
    bg: 'bg-[var(--n-status-approved-bg)]',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-[var(--n-status-approved)]',
  },
  warning: {
    bg: 'bg-[var(--n-status-submitted-bg)]',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-[var(--n-secondary)]',
  },
  error: {
    bg: 'bg-[var(--n-status-returned-bg)]',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-[var(--n-danger)]',
  },
};

const alertIcons: Record<AlertType, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

export const Alert = ({ type = 'info', children, onClose, className }: AlertProps) => {
  const styles = alertStyles[type];
  const Icon = alertIcons[type];

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-[var(--n-radius-sm)] border text-[14px] leading-relaxed animate-fade-in',
        styles.bg,
        styles.border,
        className
      )}
    >
      <Icon size={18} className={cn('mt-0.5 shrink-0', styles.icon)} />
      <div className="flex-1 text-[var(--n-text)]">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-0.5 rounded-[4px] text-[var(--n-text-tertiary)] hover:text-[var(--n-text)] hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
