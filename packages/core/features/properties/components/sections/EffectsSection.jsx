import { Sparkles, Square, SquareDashed, SquareDot, SquareStack } from "lucide-react";
import { Section } from "./Section";
import { Toggle, NumberInput, ColorPicker, Select } from "../ui";

const SHADOW_OPTIONS = [
  { value: "", label: "None" },
  { value: "shadow-sm", label: "Small" },
  { value: "shadow", label: "Medium" },
  { value: "shadow-md", label: "Large" },
  { value: "shadow-lg", label: "XL" },
  { value: "shadow-xl", label: "2XL" },
  { value: "shadow-2xl", label: "3XL" },
];

const BORDER_STYLES = [
  { value: "", label: "None", icon: null },
  { value: "border-solid", label: "Solid", icon: Square },
  { value: "border-dashed", label: "Dashed", icon: SquareDashed },
  { value: "border-dotted", label: "Dotted", icon: SquareDot },
  { value: "border-double", label: "Double", icon: SquareStack },
];

const BORDER_RADIUS = [
  { value: "rounded-none", label: "0" },
  { value: "rounded-sm", label: "SM" },
  { value: "rounded", label: "MD" },
  { value: "rounded-lg", label: "LG" },
  { value: "rounded-xl", label: "XL" },
  { value: "rounded-2xl", label: "2XL" },
  { value: "rounded-3xl", label: "3XL" },
  { value: "rounded-full", label: "Full" },
];

const OPACITY_LEVELS = [
  { value: "opacity-25", label: "25" },
  { value: "opacity-50", label: "50" },
  { value: "opacity-75", label: "75" },
  { value: "opacity-100", label: "100" },
];

function OpacityControls({ label, value, onChange, quickOptions }) {
  const getCurrentValue = () => {
    if (!value) return 100;
    if (value.startsWith("opacity-")) {
      const nums = { "opacity-25": 25, "opacity-50": 50, "opacity-75": 75, "opacity-100": 100 };
      return nums[value] || 100;
    }
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1]) : 100;
  };

  const currentVal = getCurrentValue();

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-[#71717a]">{label}</span>
      <div className="grid grid-cols-4 gap-2">
        {quickOptions.map((opt) => (
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
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] text-[#52525b]">Custom</span>
        <NumberInput
          value={currentVal}
          onChange={(v) => addClass("opacity", v === 100 ? "" : `opacity-${v < 100 ? Math.round(v/25)*25 : v}`)}
          min={0}
          max={100}
          showControls={true}
          className="w-full"
        />
      </div>
    </div>
  );
}

export function EffectsSection({ properties, addClass, isOpen, onToggle }) {
  const getBorderStyleIcon = (value) => {
    const opt = BORDER_STYLES.find(o => o.value === value);
    if (!opt || !opt.icon) return null;
    const Icon = opt.icon;
    return <Icon size={16} />;
  };

  return (
    <Section title="Effects" icon={Sparkles} isOpen={isOpen} onToggle={onToggle}>
      <div className="space-y-6">
        {/* Shadows */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#71717a]">Shadow</span>
          <Select
            value={properties.selectedClasses.shadow || ""}
            onChange={(v) => addClass("shadow", v)}
            options={SHADOW_OPTIONS}
            placeholder="None"
          />
        </div>

        {/* Opacity */}
        <OpacityControls
          label="Opacity"
          value={properties.selectedClasses.opacity || ""}
          onChange={(v) => addClass("opacity", v)}
          quickOptions={OPACITY_LEVELS}
        />

        {/* Divider */}
        <div className="border-t border-[#27272a]"></div>

        {/* Border */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-[#71717a]">Border</span>
          
          {/* Width - Full width */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-[#52525b]">Width</span>
            <NumberInput
              value={parseInt(properties.selectedClasses.borderWidth?.replace("border-", "")) || 0}
              onChange={(v) => addClass("borderWidth", v === 0 ? "" : `border-${v}`)}
              min={0}
              max={8}
              showControls={true}
              className="w-full"
            />
          </div>

          {/* Style - With icons */}
          <div className="space-y-2">
            <span className="text-[10px] text-[#52525b]">Style</span>
            <div className="grid grid-cols-2 gap-2">
              {BORDER_STYLES.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => addClass("borderStyle", opt.value === properties.selectedClasses.borderStyle ? "" : opt.value)}
                    className={`
                      h-10 px-3 flex items-center justify-center gap-2 rounded-lg
                      text-xs font-medium transition-all duration-200
                      ${properties.selectedClasses.borderStyle === opt.value
                        ? "bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/25"
                        : "bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] border border-[#27272a]"
                      }
                    `}
                  >
                    {Icon && <Icon size={16} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {parseInt(properties.selectedClasses.borderWidth?.replace("border-", "")) > 0 && (
            <div className="pt-1">
              <ColorPicker
                value={properties.selectedClasses.borderColor || "#ffffff"}
                onChange={(v) => addClass("borderColor", v)}
                label="Color"
              />
            </div>
          )}
        </div>

        {/* Border Radius */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#71717a]">Border Radius</span>
          <div className="grid grid-cols-4 gap-1.5">
            {BORDER_RADIUS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  addClass(
                    "borderRadius",
                    opt.value === properties.selectedClasses.borderRadius ? "" : opt.value
                  )
                }
                className={`
                  h-9 rounded-lg text-xs font-medium transition-all duration-200
                  ${properties.selectedClasses.borderRadius === opt.value
                    ? "bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/25"
                    : "bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] border border-[#27272a]"
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 pt-1">
          <Toggle
            value={properties.selectedClasses.blur && properties.selectedClasses.blur !== "blur-0"}
            onChange={(v) => addClass("blur", v ? "blur-sm" : "")}
            label="Blur"
          />
          <Toggle
            value={properties.selectedClasses.grayscale === "grayscale"}
            onChange={(v) => addClass("grayscale", v ? "grayscale" : "")}
            label="Grayscale"
          />
          <Toggle
            value={properties.selectedClasses.invert === "invert"}
            onChange={(v) => addClass("invert", v ? "invert" : "")}
            label="Invert Colors"
          />
        </div>
      </div>
    </Section>
  );
}
