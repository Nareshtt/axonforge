import { Clock } from 'lucide-react';

export function CommitCount({ count }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/50 rounded-md border border-neutral-800">
      <Clock size={12} className="text-neutral-500" />
      <span className="text-xs text-neutral-400">
        {count} {count === 1 ? 'commit' : 'commits'}
      </span>
    </div>
  );
}
