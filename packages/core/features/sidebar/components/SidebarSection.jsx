import { ChevronDown } from 'lucide-react';

export function SidebarSection({ title, icon, children, expanded, onToggle, rightAction }) {
  return (
    <div className="py-3">
      <div className="flex items-center px-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-xs text-neutral-400 hover:bg-neutral-800/50 flex-1 py-1.5 rounded"
        >
          {icon}
          <span className="flex-1 text-left uppercase tracking-wider">{title}</span>
          <ChevronDown size={14} className={expanded ? '' : '-rotate-90'} />
        </button>

        {rightAction && <div className="ml-1">{rightAction}</div>}
      </div>

      {expanded && <div className="px-2 mt-1">{children}</div>}
    </div>
  );
}
