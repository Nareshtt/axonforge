import { AlertCircle } from 'lucide-react';

export function DetachedBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-[#f59e0b]/10 rounded border border-[#f59e0b]/30">
      <AlertCircle size={10} className="text-[#f59e0b]" />
      <span className="text-[10px] text-[#fbbf24]">
        Viewing past state
      </span>
    </div>
  );
}
