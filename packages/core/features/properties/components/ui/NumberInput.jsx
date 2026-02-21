import { useState, useRef, useEffect, useCallback } from "react";
import { Minus, Plus } from "lucide-react";

export function NumberInput({
  value = 0,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  label,
  suffix,
  className = "",
  showControls = true,
}) {
  const [localValue, setLocalValue] = useState(String(value));
  const inputRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value.replace(/[^0-9.-]/g, "");
    setLocalValue(val);
  };

  const handleBlur = () => {
    if (localValue === "" || localValue === "-") {
      setLocalValue(String(min));
      onChange(min);
      return;
    }
    const num = parseFloat(localValue);
    if (isNaN(num)) {
      setLocalValue(String(min));
      onChange(min);
    } else {
      const clamped = Math.max(min, Math.min(max, num));
      setLocalValue(String(clamped));
      onChange(clamped);
    }
  };

  const updateValue = useCallback((newValue) => {
    const clamped = Math.max(min, Math.min(max, newValue));
    setLocalValue(String(clamped));
    onChange(clamped);
  }, [min, max, onChange]);

  const startRepeating = (direction) => {
    const current = parseFloat(localValue) || min;
    const stepAmount = direction === "up" ? step : -step;
    
    const update = () => {
      const currentVal = parseFloat(localValue) || min;
      const newVal = currentVal + stepAmount;
      if (newVal >= min && newVal <= max) {
        updateValue(newVal);
      }
    };
    
    update();
    intervalRef.current = setInterval(update, 150);
  };

  const stopRepeating = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleMouseDown = (direction) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    startRepeating(direction);
  };

  useEffect(() => {
    const handleMouseUp = () => stopRepeating();
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      stopRepeating();
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const current = parseFloat(localValue) || min;
      updateValue(Math.min(max, current + step));
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const current = parseFloat(localValue) || min;
      updateValue(Math.max(min, current - step));
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {label && (
        <span className="text-xs font-medium text-[#71717a] w-4 shrink-0">{label}</span>
      )}
      <div
        className={`
          flex items-center bg-[#0f0f12] border rounded-lg overflow-hidden
          transition-all duration-200
          border-[#27272a] hover:border-[#3f3f46]
        `}
      >
        {showControls && (
          <button
            type="button"
            onMouseDown={handleMouseDown("down")}
            onMouseUp={stopRepeating}
            onMouseLeave={stopRepeating}
            className="
              h-9 w-9 flex items-center justify-center
              text-[#a1a1aa] hover:text-white hover:bg-[#27272a]
              transition-colors duration-150
              border-r border-[#27272a]
              bg-[#18181b]
            "
          >
            <Minus size={14} />
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onWheel={(e) => e.stopPropagation()}
          className="
            flex-1 h-9 text-center text-sm font-mono text-[#e4e4e7]
            bg-transparent border-none outline-none min-w-0
          "
        />
        {showControls && (
          <button
            type="button"
            onMouseDown={handleMouseDown("up")}
            onMouseUp={stopRepeating}
            onMouseLeave={stopRepeating}
            className="
              h-9 w-9 flex items-center justify-center
              text-[#a1a1aa] hover:text-white hover:bg-[#27272a]
              transition-colors duration-150
              border-l border-[#27272a]
              bg-[#18181b]
            "
          >
            <Plus size={14} />
          </button>
        )}
      </div>
      {suffix && <span className="text-xs text-[#71717a]">{suffix}</span>}
    </div>
  );
}
