export function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-8 h-4 rounded-full relative transition-all ${value ? 'bg-[#6366f1]' : 'bg-[#1a1a1a]'}`}
    >
      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${value ? 'left-4' : 'left-0.5'}`} />
    </button>
  );
}
