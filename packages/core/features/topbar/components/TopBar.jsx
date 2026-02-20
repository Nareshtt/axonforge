import { useEditorStore } from '../../../stores/editorStore';
import logo from './logo.png';

const MENU_ITEMS = ['File', 'Edit', 'View', 'Canvas', 'Tools', 'Help'];

const ACCENT_COLOR = '#6366f1';

export function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-12 flex items-center px-4 z-50 select-none bg-black border-b border-[#1f1f1f]">
      <LogoSection />
      <MenuSection />
      <div className="flex-1" />
      <ModeToggle />
    </div>
  );
}

function LogoSection() {
  return (
    <div className="flex items-center gap-3">
      <img
        src={logo}
        alt="AxonForge"
        className="h-9 w-auto"
      />
    </div>
  );
}

function MenuSection() {
  return (
    <div className="flex items-center gap-1 ml-8">
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
