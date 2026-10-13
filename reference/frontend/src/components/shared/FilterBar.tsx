import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      className={clsx(
        'flex flex-col sm:flex-row sm:items-center gap-3 mb-4 p-4 bg-white rounded-lg border border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
}
