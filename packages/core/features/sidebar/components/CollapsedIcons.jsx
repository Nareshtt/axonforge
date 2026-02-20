import { FileText, Layers } from 'lucide-react';

export function CollapsedIcons() {
  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      <FileText size={16} className="text-[#444]" />
      <Layers size={16} className="text-[#444]" />
    </div>
  );
}
