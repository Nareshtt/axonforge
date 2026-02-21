export function Toggle({
  value = false,
  onChange,
  label,
  disabled = false,
  className = "",
}) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!value);
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {label && (
        <span className="text-sm font-medium text-[#e4e4e7]">
          {label}
        </span>
      )}
      <div
        role="switch"
        aria-checked={value}
        onClick={handleClick}
        className={`
          relative w-11 h-6 rounded-full transition-all duration-200 cursor-pointer
          ${value
            ? "bg-gradient-to-r from-[#6366f1] to-[#818cf8]"
            : "bg-[#27272a]"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:ring-2 hover:ring-[#6366f1]/30"}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md
            transition-all duration-200
            ${value ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </div>
    </div>
  );
}
