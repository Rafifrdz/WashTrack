import { User as UserIcon, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

type Page = 'customer' | 'admin';

interface ViewSwitcherProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  className?: string;
}

export function ViewSwitcher({ currentPage, onPageChange, className }: ViewSwitcherProps) {
  const isCustomer = currentPage === 'customer';

  return (
    <div className={cn("flex items-center", className)}>
      <button
        onClick={() => onPageChange(isCustomer ? 'admin' : 'customer')}
        className={cn(
          "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all border-2",
          isCustomer 
            ? "bg-gray-900 text-white border-gray-900 hover:bg-black" 
            : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
        )}
      >
        {isCustomer ? (
          <>
            <ShieldCheck className="w-4 h-4" />
            Masuk ke Admin
          </>
        ) : (
          <>
            <UserIcon className="w-4 h-4" />
            Masuk ke Customer
          </>
        )}
      </button>
    </div>
  );
}
