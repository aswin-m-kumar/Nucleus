import React from 'react';
import { cn } from '../../utils/tailwind';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'metric';
  className?: string;
}

export const Card = ({
  children,
  variant = 'default',
  className = '',
}: CardProps) => {
  const variants = {
    default: 'bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm',
    metric: 'bg-[#f4f6f8] rounded-[12px] p-4',
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
};
