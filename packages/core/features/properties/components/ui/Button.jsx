import { forwardRef } from "react";

export const Button = forwardRef(function Button(
  {
    children,
    variant = "secondary",
    size = "md",
    className = "",
    ...props
  },
  ref
) {
  const variants = {
    primary: `
      bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white
      hover:from-[#5558e3] hover:to-[#7375d9]
      shadow-md shadow-[#6366f1]/25 hover:shadow-lg hover:shadow-[#6366f1]/35
    `,
    secondary: `
      bg-[#18181b] text-[#e4e4e7] border border-[#27272a]
      hover:bg-[#27272a] hover:border-[#3f3f46]
    `,
    ghost: `
      bg-transparent text-[#a1a1aa]
      hover:bg-[#27272a] hover:text-[#e4e4e7]
    `,
    danger: `
      bg-red-600/20 text-red-400 border border-red-600/30
      hover:bg-red-600/30 hover:border-red-500/50
    `,
  };

  const sizes = {
    sm: "h-7 px-2.5 text-xs",
    md: "h-8 px-3 text-sm",
    lg: "h-10 px-4 text-sm",
  };

  return (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 focus:ring-offset-2 focus:ring-offset-[#09090b]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
        hover:transform hover:-translate-y-0.5
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});
