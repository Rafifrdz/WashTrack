import { OrderStatus } from '../types';
import { cn } from '../lib/utils';
import { Droplet, Wind, Scissors, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStyles = () => {
    switch (status) {
      case 'washing':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: <Droplet className="w-3 h-3" />,
          label: 'Washing'
        };
      case 'drying':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: <Wind className="w-3 h-3" />,
          label: 'Drying'
        };
      case 'ironing':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-200',
          icon: <Scissors className="w-3 h-3" />,
          label: 'Ironing'
        };
      case 'completed':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: 'Completed'
        };
    }
  };

  const { bg, text, border, icon, label } = getStyles();

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
      bg, text, border, className
    )}>
      {icon}
      {label}
    </span>
  );
}
