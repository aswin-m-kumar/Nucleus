import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '../../utils/tailwind';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export const Card = ({ children, hover = false, className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'bg-[var(--n-bg-card)] border border-[var(--n-border)] rounded-[var(--n-radius-md)] p-5 transition-all duration-[var(--n-transition)]',
        hover && 'hover:border-[var(--n-border-hover)] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
