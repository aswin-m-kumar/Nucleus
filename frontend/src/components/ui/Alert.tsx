import React from 'react';
import { cn } from '../../utils/tailwind';
import { Info, CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  type: AlertType;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert = ({
  type,
  children,
  onClose,
  className = '',
}: AlertProps) => {
  const styles: Record<AlertType, { bg: string; border: string; icon: any }> = {
    info: { bg: 'bg-blue-50', border: 'border-blue-500', icon: Info },
    success: { bg: 'bg-green-50', border: 'border-green-500', icon: CheckCircle },
    warning: { bg: 'bg-amber-50', border: 'border-[#BA7517]', icon: AlertTriangle },
    error: { bg: 'bg-red-50', border: 'border-red-500', icon: AlertCircle },
  };

  const Icon = styles[type].icon;

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg border-l-[8px]',
      styles[type].bg,
      styles[type].border,
      className
    )}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="flex-1 text-sm text-gray-800">
        {children}
      </div>
      {onClose && (
        <button onClick={onClose} className="p-0.5 hover:bg-black/5 rounded">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
};
