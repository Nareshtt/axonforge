export function Input({ value, onChange, placeholder, type = 'text', step, min, max, className = '' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      step={step}
      min={min}
      max={max}
      className={`h-6 bg-[#0a0a0a] border border-[#1f1f1f] rounded px-2 py-1 text-xs text-[#888] focus:outline-none focus:border-[#333] ${className}`}
    />
  );
}
