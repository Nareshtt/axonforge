export function NewPageInput({ value, onChange, onBlur, onEnter, onEscape }) {
  return (
    <div className="px-2 py-1.5">
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnter();
          if (e.key === 'Escape') onEscape();
        }}
        className="w-full bg-[#0a0a0a] border border-[#6366f1]/40 rounded px-2 py-1.5 text-xs text-white outline-none placeholder:text-[#444]"
        placeholder="New page name"
      />
    </div>
  );
}
