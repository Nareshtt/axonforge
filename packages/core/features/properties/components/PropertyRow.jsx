export function PropertyRow({ label, children, fullWidth = false }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${fullWidth ? 'flex-col items-start gap-1' : ''}`}>
      <span className="text-[11px] text-[#666] font-medium">{label}</span>
      {children}
    </div>
  );
}
