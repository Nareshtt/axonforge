import { FileText, Layers, Type, Palette, Ruler, Layout, Move } from 'lucide-react';

export function CollapsedIcons({ pageProperties }) {
  const hasBackground = pageProperties?.selectedClasses?.backgroundColor;
  const hasTypography = pageProperties?.selectedClasses?.fontFamily || pageProperties?.selectedClasses?.color;
  const hasSize = pageProperties?.selectedClasses?.width || pageProperties?.selectedClasses?.height;
  const hasDisplay = pageProperties?.selectedClasses?.display;
  const hasSpacing = pageProperties?.selectedClasses?.padding || pageProperties?.selectedClasses?.margin;

  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      <div className="relative">
        <FileText size={16} className={hasBackground ? "text-[#6366f1]" : "text-[#444]"} />
        {hasBackground && (
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#6366f1]" />
        )}
      </div>
      <div className="relative">
        <Layers size={16} className={hasDisplay ? "text-[#6366f1]" : "text-[#444]"} />
        {hasDisplay && (
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#6366f1]" />
        )}
      </div>
      <div className="relative">
        <Ruler size={16} className={hasSize ? "text-[#6366f1]" : "text-[#444]"} />
        {hasSize && (
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#6366f1]" />
        )}
      </div>
      <div className="relative">
        <Move size={16} className={hasSpacing ? "text-[#6366f1]" : "text-[#444]"} />
        {hasSpacing && (
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#6366f1]" />
        )}
      </div>
      <div className="relative">
        <Type size={16} className={hasTypography ? "text-[#6366f1]" : "text-[#444]"} />
        {hasTypography && (
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#6366f1]" />
        )}
      </div>
    </div>
  );
}
