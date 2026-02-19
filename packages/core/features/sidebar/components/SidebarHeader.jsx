import { ChevronLeft } from 'lucide-react';

export function SidebarHeader({ visuallyCollapsed, onToggle }) {
  return (
    <div className="h-10 flex items-center justify-between px-2 border-b border-neutral-800/50">
      {!visuallyCollapsed && (
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
          Explorer
        </span>
      )}

      <button
        onClick={onToggle}
        className={`w-7 h-7 rounded hover:bg-neutral-800 ${
          visuallyCollapsed ? 'mx-auto' : ''
        }`}
      >
        <ChevronLeft
          size={16}
          className={visuallyCollapsed ? 'rotate-180' : ''}
        />
      </button>
    </div>
  );
}
