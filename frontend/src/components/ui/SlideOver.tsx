import { useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/tailwind';
import { X } from 'lucide-react';

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}

export const SlideOver = ({ open, onClose, title, children, footer, width = 'w-[480px]' }: SlideOverProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  // Focus trap: focus the panel when opened
  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--n-bg-overlay)] animate-[fadeInOverlay_0.15s_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative flex flex-col h-full max-w-full bg-[var(--n-bg-card)] shadow-[var(--n-shadow-overlay)] animate-slide-in-right',
          width
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--n-border)]">
          <h2 className="text-[18px] font-semibold text-[var(--n-text)]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--n-radius-sm)] text-[var(--n-text-tertiary)] hover:text-[var(--n-text)] hover:bg-[var(--n-bg-subtle)] transition-colors"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--n-border)] bg-[var(--n-bg-subtle)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
