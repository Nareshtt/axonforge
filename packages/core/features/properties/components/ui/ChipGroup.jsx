import { useId } from "react";

export function ChipGroup({
  options,
  value,
  onChange,
  multiple = false,
  className = "",
}) {
  const id = useId();

  const handleClick = (optionValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(value === optionValue ? "" : optionValue);
    }
  };

  const isSelected = (optionValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {options.map((option, index) => (
        <button
          key={option.value || index}
          type="button"
          onClick={() => handleClick(option.value)}
          title={option.title}
          className={`
            h-8 px-3 flex items-center justify-center gap-1.5 rounded-lg
            text-xs font-medium transition-all duration-200
            ${isSelected(option.value)
              ? "bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/25"
              : "bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] border border-[#27272a]"
            }
          `}
        >
          {option.icon && (
            <option.icon
              size={14}
              className={isSelected(option.value) ? "text-white/90" : "text-[#71717a]"}
            />
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}
