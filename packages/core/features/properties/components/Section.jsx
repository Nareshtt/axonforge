import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function Section({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#1f1f1f]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-semibold text-[#888] hover:text-white hover:bg-[#0a0a0a] uppercase tracking-wider"
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
