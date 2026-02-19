export function TextButton({ text, onClick, disabled, variant = 'default' }) {
  const baseClasses = 'px-3 py-1.5 text-xs rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors';
  const disabledClasses = 'disabled:opacity-30 disabled:cursor-not-allowed';
  const variantClasses = variant === 'danger' 
    ? 'hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/30'
    : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabledClasses} ${variantClasses}`}
    >
      {text}
    </button>
  );
}
