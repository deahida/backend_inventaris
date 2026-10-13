import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({ title, subtitle, children, action, className, padding = 'md' }: CardProps) => {
  return (
    <div className={clsx('overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm', className)}>
      {(title || action) && (
        <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="ml-4 mt-2">
              {title && <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>}
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
            {action && <div className="ml-4 mt-2 flex-shrink-0">{action}</div>}
          </div>
        </div>
      )}
      <div
        className={clsx({
          'p-0': padding === 'none',
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
        })}
      >
        {children}
      </div>
    </div>
  );
};
