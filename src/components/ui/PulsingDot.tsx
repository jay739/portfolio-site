import { cn } from '@/lib/utils';

interface PulsingDotProps {
  className?: string;
  status?: 'active' | 'inactive' | 'warning';
}

export function PulsingDot({ className, status = 'active' }: PulsingDotProps) {
  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-red-500',
    warning: 'bg-yellow-500'
  };

  return (
    <span className="relative flex h-3 w-3">
      <span
        className={cn(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          statusColors[status]
        )}
      />
      <span
        className={cn(
          'relative inline-flex rounded-full h-3 w-3',
          statusColors[status]
        )}
      />
    </span>
  );
} 