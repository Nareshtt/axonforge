import { Trash2 } from 'lucide-react';

const ACCENT_COLOR = '#6366f1';

export function PageItem({ page, active, onSelect, onDoubleClick, onDelete }) {
  return (
    <div
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={`group flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors ${
        active
          ? 'bg-[#6366f1]/10 text-white border border-[#6366f1]/30'
          : 'hover:bg-[#1a1a1a] text-[#888]'
      }`}
    >
      <div className="flex-1 truncate">{page.name}</div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-[#ef4444]/20 text-[#666] hover:text-[#ef4444] transition-all"
        title="Delete Page"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
