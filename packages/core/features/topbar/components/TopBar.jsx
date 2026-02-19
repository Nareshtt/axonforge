import { useEditorStore } from '../../../stores/editorStore';
import logo from './logo.png';

const MENU_ITEMS = ['File', 'Edit', 'View', 'Canvas', 'Tools', 'Help'];

export function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 flex items-center px-5 z-50 select-none bg-gradient-to-b from-[#1f2228] via-[#0f1216] to-[#1b1e24] border-b border-[#2a2d33] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <LogoSection />

      <MenuSection />

      <div className="flex-1" />

      <ModeToggle />
    </div>
  );
}

function LogoSection() {
  return (
    <div className="flex items-center gap-6 text-sm text-[#b5b9c0]">
      <img
        src={logo}
        alt="AxonForge"
        className="h-9 w-auto mr-2 drop-shadow-[0_0_14px_rgba(255,90,30,0.45)]"
      />
    </div>
  );
}

function MenuSection() {
  return (
    <div className="flex items-center gap-6 text-sm text-[#b5b9c0]">
      {MENU_ITEMS.map((item) => (
        <MenuItem key={item} label={item} />
      ))}
    </div>
  );
}

function MenuItem({ label }) {
  return (
    <button className="group relative px-3 py-1.5 text-[#d1d4da] transition-all bg-gradient-to-b from-[#1d2026] via-[#0e1115] to-[#191d23] border border-[#24272d] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:text-[#ff7a18] hover:border-[#3a3e46] hover:-translate-y-[1px] active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
      <span className="pointer-events-none absolute left-0 bottom-0 h-px w-0 bg-gradient-to-r from-[#ff3b2f] to-[#ff7a18] transition-all duration-300 group-hover:w-full" />
      {label}
    </button>
  );
}

function ModeToggle() {
  const mode = useEditorStore((s) => s.mode);
  const toggleMode = useEditorStore((s) => s.toggleMode);
  const isEdit = mode === 'edit';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs tracking-wide text-[#8b9098]">Mode</span>

      <button
        onClick={toggleMode}
        className={`
          px-4 py-1.5 text-xs tracking-wide border transition-all bg-gradient-to-b from-[#20242a] via-[#0e1115] to-[#1a1e24] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
          ${
            isEdit
              ? 'border-[#ff3b2f] text-[#ff7a18] shadow-[0_0_14px_rgba(255,90,30,0.4)]'
              : 'border-[#2e3138] text-[#b0b4bb]'
          }
        `}
      >
        {isEdit ? 'EDIT' : 'VIEW'}
      </button>
    </div>
  );
}
