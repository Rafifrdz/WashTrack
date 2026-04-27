import { motion } from 'motion/react';
import { OrderStatus, STATUS_FLOW, STATUS_LABELS } from '../types';
import { cn } from '../lib/utils';
import { Droplet, Wind, Scissors, CheckCircle2 } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: OrderStatus;
}

const steps = [
  { id: 'washing', icon: Droplet, label: 'Washing' },
  { id: 'drying', icon: Wind, label: 'Drying' },
  { id: 'ironing', icon: Scissors, label: 'Ironing' },
  { id: 'completed', icon: CheckCircle2, label: 'Completed' },
];

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="py-8 px-4">
      <div className="relative flex justify-between">
        {/* Progress Line Bar */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 z-0 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: currentIndex / (steps.length - 1) }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ width: '100%' }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor: isCompleted || isCurrent ? '#3b82f6' : '#fff',
                  borderColor: isCompleted || isCurrent ? '#3b82f6' : '#e5e7eb',
                  color: isCompleted || isCurrent ? '#fff' : '#9ca3af'
                }}
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-shadow",
                  isCurrent && "shadow-lg shadow-blue-200"
                )}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <div className="mt-3 text-center">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider block",
                  isCurrent ? "text-blue-600" : "text-gray-400"
                )}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
