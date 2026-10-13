import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export const Spinner = ({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  return (
    <Loader2
      className={clsx(
        'animate-spin text-indigo-600',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
          'h-12 w-12': size === 'xl',
        },
        className
      )}
    />
  );
};

export const LoadingOverlay = ({ text = 'Memuat...', className }: { text?: string; className?: string }) => {
  return (
    <div className={clsx('absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80', className)}>
      <Spinner size="lg" />
      {text && <p className="mt-2 text-sm font-medium text-gray-600">{text}</p>}
    </div>
  );
};

export const PageLoading = ({ text = 'Memuat sistem...' }: { text?: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
      <Spinner size="xl" className="mb-4" />
      <p className="text-lg font-medium text-gray-700">{text}</p>
    </div>
  );
};
