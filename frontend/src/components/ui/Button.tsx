import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/tailwind';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'amber';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--n-primary)] text-white hover:bg-[var(--n-primary-hover)] active:scale-[0.98]',
  secondary:
    'bg-transparent border border-[var(--n-border)] text-[var(--n-text)] hover:border-[var(--n-border-hover)] hover:bg-[var(--n-bg-subtle)] active:scale-[0.98]',
  danger:
    'bg-[var(--n-danger)] text-white hover:bg-[var(--n-danger-hover)] active:scale-[0.98]',
  ghost:
    'bg-transparent text-[var(--n-text-secondary)] hover:bg-[var(--n-bg-subtle)] hover:text-[var(--n-text)] active:scale-[0.98]',
  amber:
    'bg-[var(--n-secondary)] text-white hover:bg-[var(--n-secondary-hover)] active:scale-[0.98]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-4 text-[14px] gap-2',
  lg: 'h-[42px] px-5 text-[15px] gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-[var(--n-radius-sm)] transition-all duration-[var(--n-transition)] cursor-pointer select-none whitespace-nowrap',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--n-primary)]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
