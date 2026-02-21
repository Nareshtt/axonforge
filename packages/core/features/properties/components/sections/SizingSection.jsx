import { Ruler } from "lucide-react";
import { Section } from "./Section";
import { NumberInput, Toggle, Select } from "../ui";

export function SizingSection({ properties, updateProperty, addClass }) {
  const width = properties.width || 100;
  const height = properties.height || 100;

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

  return (
    <Section title="Sizing" icon={Ruler}>
      <div className="space-y-6">
        {/* Width - full width */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#71717a]">Width</span>
          <NumberInput
            value={width}
            onChange={(v) => handleSizeChange("width", v)}
            min={1}
            max={3840}
            showControls={true}
            className="w-full"
          />
        </div>

        {/* Height - full width */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#71717a]">Height</span>
          <NumberInput
            value={height}
            onChange={(v) => handleSizeChange("height", v)}
            min={1}
            max={2160}
            showControls={true}
            className="w-full"
          />
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#71717a]">Aspect Ratio</span>
          <Select
            value={properties.selectedClasses.aspectRatio || ""}
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
              value={parseInt(properties.selectedClasses.minWidth?.replace("min-w-", "")) || 0}
              onChange={(v) => addClass("minWidth", v === 0 ? "" : `min-w-${v}`)}
              min={0}
              max={1920}
              showControls={true}
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium text-[#71717a]">Max Width</span>
            <NumberInput
              value={parseInt(properties.selectedClasses.maxWidth?.replace("max-w-", "")) || 0}
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
              value={parseInt(properties.selectedClasses.minHeight?.replace("min-h-", "")) || 0}
              onChange={(v) => addClass("minHeight", v === 0 ? "" : `min-h-${v}`)}
              min={0}
              max={1080}
              showControls={true}
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium text-[#71717a]">Max Height</span>
            <NumberInput
              value={parseInt(properties.selectedClasses.maxHeight?.replace("max-h-", "")) || 0}
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
            value={properties.selectedClasses.objectCover === "object-cover"}
            onChange={(v) => addClass("objectCover", v ? "object-cover" : "")}
            label="Cover (maintain ratio)"
          />
        </div>
      </div>
    </Section>
  );
}
