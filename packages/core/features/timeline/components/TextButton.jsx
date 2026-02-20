export function TextButton({ text, onClick, disabled, variant = 'default' }) {
  const baseClasses = 'px-2.5 py-1 text-xs rounded hover:bg-[#1a1a1a] text-[#666] hover:text-white transition-colors';
  const disabledClasses = 'disabled:opacity-30 disabled:cursor-not-allowed';
  const variantClasses = variant === 'danger' 
    ? 'text-[#ef4444] hover:bg-[#ef4444]/10' 
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
