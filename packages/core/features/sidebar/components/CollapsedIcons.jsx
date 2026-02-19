import { FileText, Layers } from 'lucide-react';

export function CollapsedIcons() {
  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <FileText size={18} />
      <Layers size={18} />
    </div>
  );
}
