import React from 'react';
import { cn } from '../../utils/tailwind';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string | number }[];
}

export const Select = ({
  label,
  options,
  disabled,
  className = '',
  ...props
}: SelectProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-[12px] font-medium text-gray-500">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          disabled={disabled}
          className={cn(
            'h-9 w-full pl-3 pr-8 rounded-lg border border-gray-300 text-sm appearance-none transition-all focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent focus:outline-none',
            disabled ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'bg-white',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
