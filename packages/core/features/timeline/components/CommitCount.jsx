import { Clock } from 'lucide-react';

export function CommitCount({ count }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0a0a0a] rounded border border-[#1f1f1f]">
      <Clock size={10} className="text-[#444]" />
      <span className="text-[10px] text-[#666]">
        {count} {count === 1 ? 'commit' : 'commits'}
      </span>
    </div>
  );
}
