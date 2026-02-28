import { useEditorStore } from '../../../stores/editorStore';
import { usePageStore } from '../../../stores/pageStore';
import { Code2 } from "lucide-react";
import logo from './logo.png';

const MENU_ITEMS = ['File', 'Edit', 'View', 'Canvas', 'Tools', 'Help'];

const ACCENT_COLOR = '#6366f1';

export function TopBar() {
  return (
    <div data-topbar className="fixed top-0 left-0 right-0 h-12 flex items-center px-4 z-50 select-none bg-black border-b border-[#1f1f1f]">
      <LogoSection />
      <PageTitle />
      <MenuSection />
      <div className="flex-1" />
      <ModeToggle />
    </div>
  );
}

function PageTitle() {
  const mode = useEditorStore((s) => s.mode);
  const selectedPageId = useEditorStore((s) => s.selectedPageId);
  const pages = usePageStore((s) => s.pages);

  const page = pages.find((p) => p.id === selectedPageId) || pages[0] || null;
  const label = page?.name || page?.id || "";

  if (!label) return null;

  const isEdit = mode === "edit";

  return (
    <div className="ml-2 mr-2 flex items-center gap-2 px-3 py-1.5 rounded bg-[#0f0f0f] border border-[#1f1f1f]">
      {isEdit && <Code2 size={14} className="text-[#a5b4fc]" />}
      <span className={isEdit ? "text-xs text-white" : "text-xs text-[#888]"}>{label}</span>
    </div>
  );
}

function LogoSection() {
  return (
    <div className="flex items-center gap-1">
      <img
        src={logo}
        alt="AxonForge"
        className="h-16 w-auto"
      />
    </div>
  );
}

function MenuSection() {
  return (
    <div className="flex items-center gap-1 ml-3">
      {MENU_ITEMS.map((item) => (
        <MenuItem key={item} label={item} />
      ))}
    </div>
  );
}

function MenuItem({ label }) {
  return (
    <button className="px-3 py-1.5 text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] rounded transition-all">
      {label}
    </button>
  );
}

function ModeToggle() {
  const mode = useEditorStore((s) => s.mode);
  const toggleMode = useEditorStore((s) => s.toggleMode);
  const isEdit = mode === 'edit';

  return (
    <button
      onClick={toggleMode}
      className={`
        px-3 py-1.5 text-xs font-medium rounded transition-all
        ${isEdit 
          ? `bg-[${ACCENT_COLOR}] text-white` 
          : 'bg-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#252525]'
        }
      `}
      style={isEdit ? { backgroundColor: ACCENT_COLOR } : {}}
    >
      {isEdit ? 'EDIT' : 'VIEW'}
    </button>
  );
}
