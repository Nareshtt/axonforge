import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  {
    value,
    onChange,
    placeholder,
    type = "text",
    className = "",
    error,
    ...props
  },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`
        w-full h-9 px-3 bg-[#0f0f12] border rounded-lg
        text-sm text-[#e4e4e7] placeholder:text-[#71717a]
        transition-all duration-200
        focus:outline-none
        ${error
          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          : "border-[#27272a] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 hover:border-[#3f3f46]"
        }
        ${className}
      `}
      {...props}
    />
  );
});
