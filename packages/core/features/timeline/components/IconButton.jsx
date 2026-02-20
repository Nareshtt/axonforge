export function IconButton({ icon, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 rounded hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed text-[#666] hover:text-white transition-colors"
      title={title}
    >
      {icon}
    </button>
  );
}
