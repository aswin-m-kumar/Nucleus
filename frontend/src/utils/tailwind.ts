import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns Tailwind color class for primary/secondary/danger/amber
 */
export const color = (variant: 'primary' | 'secondary' | 'danger' | 'amber') => {
  const colors = {
    primary: 'teal-600',
    secondary: 'amber-600',
    danger: 'red-500',
    amber: 'amber-600',
  };
  return colors[variant];
};

/**
 * Returns Tailwind spacing class
 */
export const spacing = (scale: 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl') => {
  const scales = {
    xs: '1',
    s: '2',
    m: '4',
    l: '6',
    xl: '8',
    '2xl': '12',
  };
  return `p-${scales[scale]}`;
};

/**
 * Returns border-radius class
 */
export const borderRadius = (size: 'sm' | 'md' | 'lg') => {
  const sizes = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
  };
  return sizes[size];
};

/**
 * Returns Tailwind focus ring classes
 */
export const focusRing = () => {
  return 'focus:ring-2 focus:ring-teal-500 focus:outline-none';
};
