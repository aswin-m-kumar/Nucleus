import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/tailwind';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, disabled, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2.5 rounded-[var(--n-radius-sm)] border text-[14px] leading-relaxed transition-all duration-[var(--n-transition)] resize-y min-h-[80px]',
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

Textarea.displayName = 'Textarea';
