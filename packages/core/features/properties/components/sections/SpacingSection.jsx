import { useState } from "react";
import { AlignHorizontalSpaceBetween } from "lucide-react";
import { Section } from "./Section";
import { NumberInput } from "../ui";

const SCOPES = [
  { key: "all", label: "All" },
  { key: "y", label: "Y" },
  { key: "x", label: "X" },
  { key: "each", label: "Each" },
];

function SpacingControls({ type, spacing, onChange }) {
  const prefix = type === "padding" ? "p" : "m";
  
  const getValue = (key) => {
    const val = spacing[key];
    if (!val) return 0;
    const match = val.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const getArbitraryValue = (key) => {
    const val = spacing[key];
    if (!val) return "";
    // key is like: p, px, py, pt, mt ...
    if (val.startsWith(`${key}-[`)) {
      const match = val.match(/\[(.+)\]/);
      return match ? match[1] : "";
    }
    return "";
  };

  const allValue = getValue(prefix);
  const yValue = getValue(prefix + "y");
  const xValue = getValue(prefix + "x");
  const tValue = getValue(prefix + "t");
  const rValue = getValue(prefix + "r");
  const bValue = getValue(prefix + "b");
  const lValue = getValue(prefix + "l");

  const [scope, setScope] = useState("all");

  const currentValue = scope === "all" ? allValue : 
                       scope === "y" ? yValue : 
                       scope === "x" ? xValue : 0;

  const currentArbitrary =
    scope === "all"
      ? getArbitraryValue(prefix)
      : scope === "y"
        ? getArbitraryValue(prefix + "y")
        : scope === "x"
          ? getArbitraryValue(prefix + "x")
          : "";

  const handleChange = (val, isArbitrary = false) => {
    if (scope === "all") {
      if (val === 0 || val === "") {
        onChange(prefix, "");
      } else if (isArbitrary) {
        onChange(prefix, `${prefix}-[${val}]`);
      } else {
        onChange(prefix, `${prefix}-${val}`);
      }
    } else if (scope === "y") {
      if (val === 0 || val === "") {
        onChange(`${prefix}y`, "");
      } else if (isArbitrary) {
        onChange(`${prefix}y`, `${prefix}y-[${val}]`);
      } else {
        onChange(`${prefix}y`, `${prefix}y-${val}`);
      }
    } else if (scope === "x") {
      if (val === 0 || val === "") {
        onChange(`${prefix}x`, "");
      } else if (isArbitrary) {
        onChange(`${prefix}x`, `${prefix}x-[${val}]`);
      } else {
        onChange(`${prefix}x`, `${prefix}x-${val}`);
      }
    }
  };

  const handleEachChange = (side, val, isArbitrary = false) => {
    const key = prefix + side;
    if (val === 0 || val === "") {
      onChange(key, "");
    } else if (isArbitrary) {
      onChange(key, `${key}-[${val}]`);
    } else {
      onChange(key, `${key}-${val}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Scope selector */}
      <div className="flex gap-1">
        {SCOPES.map((s) => (
          <button
            key={s.key}
            onClick={() => setScope(s.key)}
            className={`
              flex-1 h-8 rounded-md text-xs font-medium transition-all duration-200
              ${scope === s.key
                ? "bg-[#6366f1] text-white"
                : "bg-[#18181b] text-[#71717a] hover:text-[#e4e4e7] border border-[#27272a]"
              }
            `}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Number input */}
      {scope !== "each" ? (
        <div className="space-y-2">
          <NumberInput
            value={currentValue}
            onChange={(v) => handleChange(v, false)}
            min={0}
            max={999}
            showControls={true}
            className="w-full"
          />
          <input
            type="text"
            placeholder="Custom (e.g. 50px, 2rem)"
            className="w-full h-10 px-3 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-[#e4e4e7] focus:border-[#6366f1] focus:outline-none"
            value={currentArbitrary}
            onChange={(e) => handleChange(e.target.value.replace(/\s/g, ''), true)}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="space-y-1.5">
            <span className="text-xs text-[#71717a]">Top</span>
            <NumberInput
              value={tValue}
              onChange={(v) => handleEachChange("t", v)}
              min={0}
              max={32}
              showControls={true}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-[#71717a]">Right</span>
            <NumberInput
              value={rValue}
              onChange={(v) => handleEachChange("r", v)}
              min={0}
              max={32}
              showControls={true}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-[#71717a]">Bottom</span>
            <NumberInput
              value={bValue}
              onChange={(v) => handleEachChange("b", v)}
              min={0}
              max={32}
              showControls={true}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-[#71717a]">Left</span>
            <NumberInput
              value={lValue}
              onChange={(v) => handleEachChange("l", v)}
              min={0}
              max={32}
              showControls={true}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function SpacingSection({ sectionProperties: sectionProperties, addClass, isOpen, onToggle, disableMargin = false }) {
  const [activeType, setActiveType] = useState(disableMargin ? "padding" : "padding");
  const spacing = sectionProperties?.selectedClasses || {};

  const handleChange = (key, value) => {
    addClass(key, value);
  };

  return (
    <Section title="Spacing" icon={AlignHorizontalSpaceBetween} isOpen={isOpen} onToggle={onToggle}>
      <div className="space-y-4">
        {/* Type selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveType("padding")}
            className={`
              flex-1 h-9 rounded-lg text-sm font-medium transition-all duration-200
              ${activeType === "padding"
                ? "bg-[#6366f1] text-white"
                : "bg-[#18181b] text-[#a1a1aa] hover:text-[#e4e4e7] border border-[#27272a]"
              }
            `}
          >
            Padding
          </button>
          {!disableMargin && (
            <button
              onClick={() => setActiveType("margin")}
              className={`
                flex-1 h-9 rounded-lg text-sm font-medium transition-all duration-200
                ${activeType === "margin"
                  ? "bg-[#6366f1] text-white"
                  : "bg-[#18181b] text-[#a1a1aa] hover:text-[#e4e4e7] border border-[#27272a]"
                }
              `}
            >
              Margin
            </button>
          )}
        </div>

        <SpacingControls
          type={activeType}
          spacing={spacing}
          onChange={handleChange}
        />
      </div>
    </Section>
  );
}
