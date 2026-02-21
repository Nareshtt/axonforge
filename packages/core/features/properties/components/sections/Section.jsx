import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function Section({ title, children, defaultOpen = true, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#27272a]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full flex items-center justify-between px-4 py-4
          text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider
          hover:bg-[#18181b] transition-colors duration-150
        "
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-[#6366f1]" />}
          <span>{title}</span>
        </div>
        <ChevronDown
          size={14}
          className={`text-[#52525b] transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
        />
      </button>
      <div
        className={`
          overflow-hidden transition-all duration-200 ease-out
          ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="px-4 pb-6">{children}</div>
      </div>
    </div>
  );
}
