import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/tailwind';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, disabled, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'h-9 w-full px-3 rounded-[var(--n-radius-sm)] border text-[14px] transition-all duration-[var(--n-transition)]',
            'bg-[var(--n-bg-card)] text-[var(--n-text)] placeholder:text-[var(--n-text-tertiary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--n-primary)] focus:border-transparent',
            error
              ? 'border-[var(--n-danger)] focus:ring-[var(--n-danger)]'
              : 'border-[var(--n-border)] hover:border-[var(--n-border-hover)]',
            disabled && 'opacity-50 cursor-not-allowed bg-[var(--n-bg-subtle)]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-[var(--n-danger)] mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
