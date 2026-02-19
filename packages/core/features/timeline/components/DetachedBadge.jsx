import { AlertCircle } from 'lucide-react';

export function DetachedBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-md border border-amber-500/30">
      <AlertCircle size={12} className="text-amber-400" />
      <span className="text-xs text-amber-300">
        Viewing past state - Edit to create branch
      </span>
    </div>
  );
}
