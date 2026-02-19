export function IconButton({ icon, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-400 hover:text-white transition-colors"
      title={title}
    >
      {icon}
    </button>
  );
}
