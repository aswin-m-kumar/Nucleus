import React from 'react';
import { cn } from '../../utils/tailwind';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({
  label,
  error,
  disabled,
  className = '',
  ...props
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-[12px] font-medium text-gray-500">
          {label}
        </label>
      )}
      <input
        disabled={disabled}
        className={cn(
          'h-9 w-full px-3 rounded-lg border border-gray-300 text-sm transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent focus:outline-none',
          error ? 'border-red-500 focus:ring-red-500' : '',
          disabled ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'bg-white',
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-[10px] text-red-500 font-medium">
          {error}
        </span>
      )}
    </div>
  );
};
