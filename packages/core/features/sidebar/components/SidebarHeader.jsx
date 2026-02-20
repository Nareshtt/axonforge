import { ChevronLeft } from 'lucide-react';

export function SidebarHeader({ visuallyCollapsed, onToggle }) {
  return (
    <div className="h-10 flex items-center justify-between px-3 border-b border-[#1f1f1f]">
      {!visuallyCollapsed && (
        <span className="text-xs font-medium text-[#666] uppercase tracking-wider">
          Explorer
        </span>
      )}

      <button
        onClick={onToggle}
        className={`w-6 h-6 flex items-center justify-center rounded hover:bg-[#1a1a1a] transition-colors ${
          visuallyCollapsed ? 'mx-auto' : ''
        }`}
      >
        <ChevronLeft
          size={14}
          className={`text-[#666] ${visuallyCollapsed ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
}
