import { Layout, Grid, ArrowRight, ArrowDown, AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal, AlignStartVertical, AlignCenterVertical, AlignEndVertical, MoveVertical, PanelLeft, PanelRight, Minimize2 } from "lucide-react";
import { Section } from "./Section";
import { Select, Toggle, NumberInput } from "../ui";

const DISPLAY_OPTIONS = [
  { value: "block", label: "Block" },
  { value: "flex", label: "Flex" },
  { value: "grid", label: "Grid" },
  { value: "inline-block", label: "Inline" },
  { value: "inline-flex", label: "Inline Flex" },
  { value: "none", label: "Hidden" },
];

const FLEX_DIRECTION = [
  { value: "flex-row", title: "Row" },
  { value: "flex-col", title: "Column" },
];

const JUSTIFY_OPTIONS = [
  { value: "justify-start", title: "Start" },
  { value: "justify-center", title: "Center" },
  { value: "justify-end", title: "End" },
  { value: "justify-between", title: "Between" },
  { value: "justify-around", title: "Around" },
  { value: "justify-evenly", title: "Evenly" },
];

const ALIGN_OPTIONS = [
  { value: "items-start", title: "Start" },
  { value: "items-center", title: "Center" },
  { value: "items-end", title: "End" },
  { value: "items-stretch", title: "Stretch" },
];

const COL_OPTIONS = [1, 2, 3, 4, 6, 12];
const GAP_OPTIONS = [0, 1, 2, 3, 4, 6, 8];

function GridControls({ label, value, onChange, quickOptions }) {
  const numValue = typeof value === "number" ? value : parseInt(String(value).replace(/\D/g, "")) || 0;
  const firstRow = quickOptions.slice(0, 4);
  const secondRow = quickOptions.slice(4);

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-[#71717a]">{label}</span>
      <NumberInput
        value={numValue}
        onChange={onChange}
        min={0}
        max={12}
        showControls={true}
        className="w-full"
      />
      <div className="grid grid-cols-4 gap-2">
        {firstRow.map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`
              h-9 flex items-center justify-center rounded-lg
              text-xs font-medium transition-all duration-200
              ${numValue === num
                ? "bg-[#6366f1] text-white shadow-sm"
                : "bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] border border-[#27272a]"
              }
            `}
          >
            {num}
          </button>
        ))}
      </div>
      {secondRow.length > 0 && (
        <div className={`grid gap-2 ${secondRow.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {secondRow.map((num) => (
            <button
              key={num}
              onClick={() => onChange(num)}
              className={`
                h-9 flex items-center justify-center rounded-lg
                text-xs font-medium transition-all duration-200
                ${numValue === num
                  ? "bg-[#6366f1] text-white shadow-sm"
                  : "bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] border border-[#27272a]"
                }
              `}
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function LayoutSection({ properties, addClass, isOpen, onToggle }) {
  const displayType = properties.selectedClasses.display || "block";
  
  const colValue = properties.selectedClasses.gridTemplateColumns;
  const colNum = colValue ? parseInt(String(colValue).replace(/\D/g, "")) : 1;
  
  const gapValue = properties.selectedClasses.gap;
  const gapNum = gapValue ? parseInt(String(gapValue).replace(/\D/g, "")) : 0;

  const getJustifyIcon = (value) => {
    switch (value) {
      case "justify-start": return <PanelLeft size={16} />;
      case "justify-center": return <div className="w-4 text-center">·</div>;
      case "justify-end": return <PanelRight size={16} />;
      case "justify-between": return <div className="flex gap-0.5 text-[10px]"><span>|</span><span>|</span></div>;
      case "justify-around": return <div className="flex items-center gap-0.5 text-[10px]"><span>·</span><span>|</span><span>·</span></div>;
      case "justify-evenly": return <div className="flex items-center gap-0.5 text-[10px]"><span>|</span><span>|</span><span>|</span></div>;
      default: return null;
    }
  };

  const getAlignIcon = (value) => {
    switch (value) {
      case "items-start": return <AlignStartVertical size={16} />;
      case "items-center": return <div className="w-4 text-center">·</div>;
      case "items-end": return <AlignEndVertical size={16} />;
      case "items-stretch": return <MoveVertical size={16} />;
      default: return null;
    }
  };

  return (
    <Section title="Layout" icon={Layout} isOpen={isOpen} onToggle={onToggle}>
      <div className="space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#71717a]">Display</span>
          <Select
            value={displayType}
            onChange={(v) => addClass("display", v)}
            options={DISPLAY_OPTIONS}
            placeholder="Select display..."
          />
        </div>

        {displayType === "flex" && (
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <span className="text-xs font-medium text-[#71717a]">Direction</span>
              <div className="grid grid-cols-2 gap-2">
                {FLEX_DIRECTION.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => addClass("flexDirection", opt.value === properties.selectedClasses.flexDirection ? "" : opt.value)}
                    className={`
                      h-10 px-3 flex items-center justify-center gap-2 rounded-lg
                      text-xs font-medium transition-all duration-200
                      ${properties.selectedClasses.flexDirection === opt.value
                        ? "bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/25"
                        : "bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] border border-[#27272a]"
                      }
                    `}
                  >
                    {opt.value === "flex-row" && <ArrowRight size={16} />}
                    {opt.value === "flex-col" && <ArrowDown size={16} />}
                    {opt.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-[#71717a]">Justify</span>
              <div className="grid grid-cols-2 gap-2">
                {JUSTIFY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => addClass("justifyContent", opt.value === properties.selectedClasses.justifyContent ? "" : opt.value)}
                    className={`
                      h-10 px-3 flex items-center justify-center gap-2 rounded-lg
                      text-xs font-medium transition-all duration-200
                      ${properties.selectedClasses.justifyContent === opt.value
                        ? "bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/25"
                        : "bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] border border-[#27272a]"
                      }
                    `}
                  >
                    {getJustifyIcon(opt.value)}
                    {opt.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-[#71717a]">Align</span>
              <div className="grid grid-cols-2 gap-2">
                {ALIGN_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => addClass("alignItems", opt.value === properties.selectedClasses.alignItems ? "" : opt.value)}
                    className={`
                      h-10 px-3 flex items-center justify-center gap-2 rounded-lg
                      text-xs font-medium transition-all duration-200
                      ${properties.selectedClasses.alignItems === opt.value
                        ? "bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/25"
                        : "bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] border border-[#27272a]"
                      }
                    `}
                  >
                    {getAlignIcon(opt.value)}
                    {opt.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {displayType === "grid" && (
          <div className="space-y-6 pt-2">
            <GridControls
              label="Columns"
              value={colNum}
              onChange={(v) => addClass("gridTemplateColumns", v === 1 ? "" : `grid-cols-${v}`)}
              quickOptions={COL_OPTIONS}
            />

            <GridControls
              label="Gap"
              value={gapNum}
              onChange={(v) => addClass("gap", v === 0 ? "" : `gap-${v}`)}
              quickOptions={GAP_OPTIONS}
            />

            <div className="pt-2">
              <Toggle
                value={properties.selectedClasses.gridCols === "grid-cols-12"}
                onChange={(v) => addClass("gridCols", v ? "grid-cols-12" : "")}
                label="Auto-fit columns"
              />
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
