import { Ruler } from "lucide-react";
import { Section } from "./Section";
import { NumberInput, Toggle, Select } from "../ui";

const WIDTH_OPTIONS = [
  { value: "w-full", label: "Full" },
  { value: "w-auto", label: "Auto" },
  { value: "w-screen", label: "Screen" },
  { value: "w-min", label: "Min" },
  { value: "w-max", label: "Max" },
  { value: "w-fit", label: "Fit" },
];

const HEIGHT_OPTIONS = [
  { value: "h-full", label: "Full" },
  { value: "h-auto", label: "Auto" },
  { value: "h-screen", label: "Screen" },
  { value: "h-min", label: "Min" },
  { value: "h-max", label: "Max" },
  { value: "h-fit", label: "Fit" },
  { value: "min-h-screen", label: "Min Screen" },
];

export function SizingSection({ sectionProperties: sectionProperties, updateProperty, addClass, isOpen, onToggle }) {
  const width = sectionProperties.width || 100;
  const height = sectionProperties.height || 100;

  const currentWidthClass = sectionProperties.selectedClasses?.width || "";
  const currentHeightClass = sectionProperties.selectedClasses?.height || "";

  const aspectRatios = [
    { value: "", label: "None" },
    { value: "aspect-video", label: "16:9" },
    { value: "aspect-[4/3]", label: "4:3" },
    { value: "aspect-[3/2]", label: "3:2" },
    { value: "aspect-square", label: "1:1" },
    { value: "aspect-[3/4]", label: "3:4" },
    { value: "aspect-[2/3]", label: "2:3" },
  ];

  const handleSizeChange = (dimension, value) => {
    updateProperty(dimension, value);
    addClass(dimension, value ? `w-${value}` : "");
  };

  const getNumericWidth = () => {
    const match = currentWidthClass?.match(/w-\[?(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const getNumericHeight = () => {
    const match = currentHeightClass?.match(/h-\[?(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const isFullWidth = currentWidthClass === "w-full" || currentWidthClass === "w-screen";
  const isFullHeight = currentHeightClass === "h-full" || currentHeightClass === "h-screen";

  return (
    <Section title="Sizing" icon={Ruler} isOpen={isOpen} onToggle={onToggle}>
      <div className="space-y-6">
        {/* Width */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#71717a]">Width</span>
          <div className="grid grid-cols-3 gap-2">
            {WIDTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  console.log("🟦 Width click:", { category: "width", value: opt.value, current: sectionProperties.selectedClasses });
                  addClass("width", opt.value);
                }}
                className={`
                  h-9 px-2 flex items-center justify-center rounded-lg
                  text-xs font-medium transition-all duration-200
                  ${currentWidthClass === opt.value
                    ? "bg-[#6366f1] text-white shadow-sm"
                    : "bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] border border-[#27272a]"
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
          
          {!isFullWidth && (
            <>
              <NumberInput
                value={getNumericWidth()}
                onChange={(v) => {
                  if (v > 0) {
                    addClass("width", `w-${v}`);
                  } else {
                    addClass("width", "");
                  }
                }}
                min={0}
                max={3840}
                showControls={true}
                className="w-full"
              />
              <input
                type="text"
                placeholder="Custom (e.g. 500px, 50%, 20rem)"
                className="w-full h-10 px-3 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-[#e4e4e7] focus:border-[#6366f1] focus:outline-none"
                value={currentWidthClass?.startsWith("w-[") ? currentWidthClass.replace("w-[", "").replace("]", "") : ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\s/g, '');
                  if (val) {
                    addClass("width", `w-[${val}]`);
                  } else {
                    addClass("width", "");
                  }
                }}
              />
            </>
          )}
        </div>

        {/* Height */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#71717a]">Height</span>
          <div className="grid grid-cols-3 gap-2">
            {HEIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  console.log("🟩 Height click:", { category: "height", value: opt.value, current: sectionProperties.selectedClasses });
                  addClass("height", opt.value);
                }}
                className={`
                  h-9 px-2 flex items-center justify-center rounded-lg
                  text-xs font-medium transition-all duration-200
                  ${currentHeightClass === opt.value
                    ? "bg-[#6366f1] text-white shadow-sm"
                    : "bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] border border-[#27272a]"
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
          
          {!isFullHeight && (
            <>
              <NumberInput
                value={getNumericHeight()}
                onChange={(v) => {
                  if (v > 0) {
                    addClass("height", `h-${v}`);
                  } else {
                    addClass("height", "");
                  }
                }}
                min={0}
                max={2160}
                showControls={true}
                className="w-full"
              />
              <input
                type="text"
                placeholder="Custom (e.g. 500px, 50%, 20rem)"
                className="w-full h-10 px-3 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-[#e4e4e7] focus:border-[#6366f1] focus:outline-none"
                value={currentHeightClass?.startsWith("h-[") ? currentHeightClass.replace("h-[", "").replace("]", "") : ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\s/g, '');
                  if (val) {
                    addClass("height", `h-[${val}]`);
                  } else {
                    addClass("height", "");
                  }
                }}
              />
            </>
          )}
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#71717a]">Aspect Ratio</span>
          <Select
            value={sectionProperties.selectedClasses.aspectRatio || ""}
            onChange={(v) => addClass("aspectRatio", v)}
            options={aspectRatios}
            placeholder="None"
          />
        </div>

        {/* Min/Max Width - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <span className="text-xs font-medium text-[#71717a]">Min Width</span>
            <NumberInput
              value={parseInt(sectionProperties.selectedClasses.minWidth?.replace("min-w-", "").replace(/\[(\d+)\]/, "$1")) || 0}
              onChange={(v) => addClass("minWidth", v === 0 ? "" : `min-w-${v}`)}
              min={0}
              max={1920}
              showControls={true}
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium text-[#71717a]">Max Width</span>
            <NumberInput
              value={parseInt(sectionProperties.selectedClasses.maxWidth?.replace("max-w-", "").replace(/\[(\d+)\]/, "$1")) || 0}
              onChange={(v) => addClass("maxWidth", v === 0 ? "" : `max-w-${v}`)}
              min={0}
              max={3840}
              showControls={true}
            />
          </div>
        </div>

        {/* Min/Max Height - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <span className="text-xs font-medium text-[#71717a]">Min Height</span>
            <NumberInput
              value={parseInt(sectionProperties.selectedClasses.minHeight?.replace("min-h-", "").replace(/\[(\d+)\]/, "$1")) || 0}
              onChange={(v) => addClass("minHeight", v === 0 ? "" : `min-h-${v}`)}
              min={0}
              max={1080}
              showControls={true}
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium text-[#71717a]">Max Height</span>
            <NumberInput
              value={parseInt(sectionProperties.selectedClasses.maxHeight?.replace("max-h-", "").replace(/\[(\d+)\]/, "$1")) || 0}
              onChange={(v) => addClass("maxHeight", v === 0 ? "" : `max-h-${v}`)}
              min={0}
              max={2160}
              showControls={true}
            />
          </div>
        </div>

        {/* Object Fit */}
        <div className="pt-2">
          <Toggle
            value={sectionProperties.selectedClasses.objectCover === "object-cover"}
            onChange={(v) => addClass("objectCover", v ? "object-cover" : "")}
            label="Cover (maintain ratio)"
          />
        </div>
      </div>
    </Section>
  );
}
