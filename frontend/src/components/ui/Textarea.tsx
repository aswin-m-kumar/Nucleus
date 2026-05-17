import React from 'react';
import { cn } from '../../utils/tailwind';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  maxRows?: number;
}

export const Textarea = ({
  label,
  rows = 4,
  className = '',
  ...props
}: TextareaProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-[12px] font-medium text-gray-500">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={cn(
          'w-full p-3 rounded-lg border border-gray-300 text-sm transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent focus:outline-none resize-none',
          className
        )}
        {...props}
      />
    </div>
  );
};
