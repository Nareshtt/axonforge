export function NewPageInput({ value, onChange, onBlur, onEnter, onEscape }) {
  return (
    <div className="px-3 py-1.5">
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnter();
          if (e.key === 'Escape') onEscape();
        }}
        className="w-full bg-neutral-900 border border-sky-500/40 rounded px-1 outline-none"
        placeholder="New page name"
      />
    </div>
  );
}
