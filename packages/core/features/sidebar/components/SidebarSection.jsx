import { ChevronDown } from 'lucide-react';

export function SidebarSection({ title, icon, children, expanded, onToggle, rightAction }) {
  return (
    <div className="py-2">
      <div className="flex items-center px-2">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-xs text-[#666] hover:text-white hover:bg-[#1a1a1a] flex-1 py-1.5 px-2 rounded transition-colors"
        >
          <span className="text-[#555]">{icon}</span>
          <span className="flex-1 text-left uppercase tracking-wider font-medium">{title}</span>
          <ChevronDown size={12} className={`text-[#555] transition-transform ${expanded ? '' : '-rotate-90'}`} />
        </button>

        {rightAction && <div className="ml-1">{rightAction}</div>}
      </div>

      {expanded && <div className="px-1 mt-1">{children}</div>}
    </div>
  );
}
