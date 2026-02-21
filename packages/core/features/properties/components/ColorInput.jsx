export function ColorInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
      />
      <input
        type="text"
        value={value || '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 h-6 bg-[#0a0a0a] border border-[#1f1f1f] rounded px-2 py-1 text-xs text-[#888] focus:outline-none focus:border-[#333]"
      />
    </div>
  );
}
