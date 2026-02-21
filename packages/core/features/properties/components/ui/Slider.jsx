import { useState, useRef, useEffect } from "react";

export function Slider({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  className = "",
}) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleTrackClick = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const rawValue = min + percent * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    onChange(clampedValue);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    handleTrackClick(e);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const rawValue = min + percent * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      onChange(clampedValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, min, max, step, onChange]);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs font-medium text-[#71717a]">{label}</span>}
          {showValue && <span className="text-xs font-mono text-[#a1a1aa]">{value}</span>}
        </div>
      )}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        className="
          relative h-2 w-full bg-[#27272a] rounded-full cursor-pointer
          hover:bg-[#3f3f46] transition-colors duration-150
        "
      >
        <div
          className="
            absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#6366f1] to-[#818cf8]
            rounded-full transition-all duration-75
          "
          style={{ width: `${percentage}%` }}
        />
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg
            border-2 border-[#6366f1] cursor-grab active:cursor-grabbing
            transition-transform duration-150
            ${isDragging ? "scale-110" : "scale-100 hover:scale-105"}
          `}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}
