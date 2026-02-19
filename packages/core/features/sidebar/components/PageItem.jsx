import { Trash2 } from 'lucide-react';

export function PageItem({ page, active, onSelect, onDelete }) {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer ${
        active
          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
          : 'hover:bg-neutral-800 text-neutral-300'
      }`}
    >
      <div className="flex-1 truncate">{page.name}</div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
        title="Delete Page"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
