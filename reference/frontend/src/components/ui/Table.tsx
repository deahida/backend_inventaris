import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { clsx } from 'clsx';

export interface TableProps {
  children: ReactNode;
  className?: string;
}

export const Table = ({ children, className }: TableProps) => (
  <div className={clsx('overflow-x-auto rounded-lg border border-gray-200 shadow-sm', className)}>
    <table className="min-w-full divide-y divide-gray-200 bg-white">
      {children}
    </table>
  </div>
);

export const Thead = ({ children, className }: { children: ReactNode; className?: string }) => (
  <thead className={clsx('bg-gray-50', className)}>{children}</thead>
);

export interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export const Th = ({ children, className, sortable, sortDirection, onSort, ...props }: ThProps) => (
  <th
    scope="col"
    className={clsx(
      'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500',
      sortable && 'cursor-pointer hover:bg-gray-100',
      className
    )}
    onClick={sortable ? onSort : undefined}
    {...props}
  >
    <div className="flex items-center space-x-1">
      <span>{children}</span>
      {sortable && (
        <span className="text-gray-400">
          {sortDirection === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : sortDirection === 'desc' ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4" />
          )}
        </span>
      )}
    </div>
  </th>
);

export const Tbody = ({ children, className }: { children: ReactNode; className?: string }) => (
  <tbody className={clsx('divide-y divide-gray-200 bg-white', className)}>{children}</tbody>
);

export const Tr = ({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) => (
  <tr 
    className={clsx('hover:bg-gray-50', onClick && 'cursor-pointer', className)} 
    onClick={onClick}
  >
    {children}
  </tr>
);

export const Td = ({ children, className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={clsx('whitespace-nowrap px-6 py-4 text-sm text-gray-900', className)} {...props}>
    {children}
  </td>
);
