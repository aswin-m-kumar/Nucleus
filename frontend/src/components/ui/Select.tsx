import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/tailwind';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, disabled, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              'h-9 w-full pl-3 pr-9 rounded-[var(--n-radius-sm)] border text-[14px] appearance-none transition-all duration-[var(--n-transition)]',
              'bg-[var(--n-bg-card)] text-[var(--n-text)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--n-primary)] focus:border-transparent',
              error
                ? 'border-[var(--n-danger)] focus:ring-[var(--n-danger)]'
                : 'border-[var(--n-border)] hover:border-[var(--n-border-hover)]',
              disabled && 'opacity-50 cursor-not-allowed bg-[var(--n-bg-subtle)]',
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
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--n-text-tertiary)]"
          />
        </div>
        {error && (
          <p className="text-[12px] text-[var(--n-danger)] mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
