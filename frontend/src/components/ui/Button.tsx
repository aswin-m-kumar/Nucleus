import React from 'react';
import { cn } from '../../utils/tailwind';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'amber';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-[#1D9E75] text-white hover:bg-[#15805d] active:scale-[0.98]',
    secondary: 'border border-[#1D9E75] text-[#1D9E75] hover:bg-teal-50 active:scale-[0.98]',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]',
    amber: 'bg-[#BA7517] text-white hover:bg-[#9a6113] active:scale-[0.98]',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-5 text-sm',
    lg: 'h-11 px-8 text-base',
  };

  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:ring-2 focus:ring-[#1D9E75] focus:outline-none',
        variantClasses[variant],
        sizeClasses[size],
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-300 border-gray-300 text-gray-500' : 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
