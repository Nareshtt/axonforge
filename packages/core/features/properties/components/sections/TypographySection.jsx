import { Type, AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal, AlignJustify, ArrowRight, ArrowDown, PanelLeft, PanelRight, Minimize2 } from "lucide-react";
import { Section } from "./Section";
import { Select, Toggle, NumberInput, ChipGroup } from "../ui";

const FONT_SIZES = [
  { value: "text-xs", label: "XS" },
  { value: "text-sm", label: "S" },
  { value: "text-base", label: "M" },
  { value: "text-lg", label: "L" },
  { value: "text-xl", label: "XL" },
  { value: "text-2xl", label: "2X" },
  { value: "text-3xl", label: "3X" },
  { value: "text-4xl", label: "4X" },
];

function SizeControls({ label, value, onChange, quickOptions }) {
  const getCurrentValue = () => {
    if (!value) return 16;
    if (value.startsWith("text-") && !value.includes("[")) {
      const sizes = { "text-xs": 12, "text-sm": 14, "text-base": 16, "text-lg": 18, "text-xl": 20, "text-2xl": 24, "text-3xl": 30, "text-4xl": 36 };
      return sizes[value] || 16;
    }
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1]) : 16;
  };

  const currentVal = getCurrentValue();
  const firstRow = quickOptions.slice(0, 4);
  const secondRow = quickOptions.slice(4);

  const getClassForValue = (val) => {
    const sizeMap = { 12: "text-xs", 14: "text-sm", 16: "text-base", 18: "text-lg", 20: "text-xl", 24: "text-2xl", 30: "text-3xl", 36: "text-4xl" };
    return sizeMap[val] || `text-[${val}px]`;
  };

  const isCustomValue = () => {
    if (!value) return false;
    if (value.startsWith("text-") && !value.includes("[")) return false;
    return true;
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-[#71717a]">{label}</span>
      <div className="grid grid-cols-4 gap-2">
        {firstRow.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value === value ? "" : opt.value)}
            className={`
              h-9 flex items-center justify-center rounded-lg
              text-xs font-medium transition-all duration-200
              ${value === opt.value
                ? "bg-[#6366f1] text-white shadow-sm"
                : "bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] border border-[#27272a]"
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {secondRow.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {secondRow.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value === value ? "" : opt.value)}
              className={`
                h-9 flex items-center justify-center rounded-lg
                text-xs font-medium transition-all duration-200
                ${value === opt.value
                  ? "bg-[#6366f1] text-white shadow-sm"
                  : "bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] border border-[#27272a]"
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] text-[#52525b]">Custom</span>
        <NumberInput
          value={currentVal}
          onChange={(v) => onChange(v === 16 ? "" : `text-[${v}px]`)}
          min={8}
          max={72}
          showControls={true}
          className="w-full"
        />
      </div>
    </div>
  );
}

const FONT_WEIGHT_OPTIONS = [
  { value: "font-thin", label: "Thin" },
  { value: "font-extralight", label: "ExtraLight" },
  { value: "font-light", label: "Light" },
  { value: "font-normal", label: "Normal" },
  { value: "font-medium", label: "Medium" },
  { value: "font-semibold", label: "SemiBold" },
  { value: "font-bold", label: "Bold" },
  { value: "font-extrabold", label: "ExtraBold" },
];

const TEXT_ALIGNS = [
  { value: "text-left", title: "Start" },
  { value: "text-center", title: "Center" },
  { value: "text-right", title: "End" },
  { value: "text-justify", title: "Justify" },
];

const LINE_HEIGHTS = [
  { value: "leading-none", label: "None", size: 1 },
  { value: "leading-tight", label: "Tight", size: 1.25 },
  { value: "leading-snug", label: "Snug", size: 1.375 },
  { value: "leading-normal", label: "Normal", size: 1.5 },
  { value: "leading-relaxed", label: "Relaxed", size: 1.625 },
  { value: "leading-loose", label: "Loose", size: 2 },
];

const LETTER_SPACING = [
  { value: "tracking-tighter", label: "Tighter" },
  { value: "tracking-tight", label: "Tight" },
  { value: "tracking-normal", label: "Normal" },
  { value: "tracking-wide", label: "Wide" },
  { value: "tracking-wider", label: "Wider" },
  { value: "tracking-widest", label: "Widest" },
];

const getTextAlignIcon = (value) => {
  switch (value) {
    case "text-left": return <PanelLeft size={16} />;
    case "text-center": return <div className="w-4 text-center">·</div>;
    case "text-right": return <PanelRight size={16} />;
    case "text-justify": return <Minimize2 size={16} className="rotate-90" />;
    default: return null;
  }
};

export function TypographySection({ properties, addClass, isOpen, onToggle }) {
  const fontSizeValue = properties.selectedClasses.fontSize || "";

  const getWeightDisplay = (option) => {
    const weights = { "font-thin": 100, "font-extralight": 200, "font-light": 300, "font-normal": 400, "font-medium": 500, "font-semibold": 600, "font-bold": 700, "font-extrabold": 800 };
    return weights[option.value] || 400;
  };

  return (
    <Section title="Typography" icon={Type} isOpen={isOpen} onToggle={onToggle}>
      <div className="space-y-6">
        {/* Font Size */}
        <SizeControls
          label="Size"
          value={fontSizeValue}
          onChange={(v) => addClass("fontSize", v)}
          quickOptions={FONT_SIZES}
        />

        {/* Font Weight */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#71717a]">Weight</span>
          <Select
            value={properties.selectedClasses.fontWeight || ""}
            onChange={(v) => addClass("fontWeight", v)}
            options={FONT_WEIGHT_OPTIONS.map(opt => ({
              ...opt,
              label: <span style={{ fontWeight: getWeightDisplay(opt) }}>{opt.label}</span>
            }))}
            placeholder="Select weight..."
          />
        </div>

        {/* Text Align */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#71717a]">Align</span>
          <div className="grid grid-cols-2 gap-2">
            {TEXT_ALIGNS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => addClass("textAlign", opt.value === properties.selectedClasses.textAlign ? "" : opt.value)}
                className={`
                  h-10 px-3 flex items-center justify-center gap-2 rounded-lg
                  text-xs font-medium transition-all duration-200
                  ${properties.selectedClasses.textAlign === opt.value
                    ? "bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/25"
                    : "bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] border border-[#27272a]"
                  }
                `}
              >
                {getTextAlignIcon(opt.value)}
                {opt.title}
              </button>
            ))}
          </div>
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#71717a]">Line Height</span>
          <Select
            value={properties.selectedClasses.leading || "leading-normal"}
            onChange={(v) => addClass("leading", v)}
            options={LINE_HEIGHTS}
            placeholder="Select line height..."
          />
        </div>

        {/* Letter Spacing */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#71717a]">Letter Spacing</span>
          <Select
            value={properties.selectedClasses.tracking || "tracking-normal"}
            onChange={(v) => addClass("tracking", v)}
            options={LETTER_SPACING}
            placeholder="Select spacing..."
          />
        </div>

        {/* Text Transform */}
        <div className="space-y-3 pt-2">
          <Toggle
            value={properties.selectedClasses.uppercase === "uppercase"}
            onChange={(v) => addClass("uppercase", v ? "uppercase" : "")}
            label="Uppercase"
          />
          <Toggle
            value={properties.selectedClasses.lowercase === "lowercase"}
            onChange={(v) => addClass("lowercase", v ? "lowercase" : "")}
            label="Lowercase"
          />
        </div>
      </div>
    </Section>
  );
}
