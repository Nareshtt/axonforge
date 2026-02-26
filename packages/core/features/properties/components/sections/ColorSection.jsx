import { Palette } from "lucide-react";
import { Section } from "./Section";
import { ColorPicker } from "../ui";

const COLOR_PROPERTIES = [
  { key: "backgroundColor", label: "Background" },
  { key: "textColor", label: "Text" },
  { key: "borderColor", label: "Border" },
  { key: "shadowColor", label: "Shadow" },
  { key: "fillColor", label: "Fill" },
  { key: "strokeColor", label: "Stroke" },
  { key: "placeholderColor", label: "Placeholder" },
  { key: "iconColor", label: "Icon" },
];

export function ColorSection({ properties, addClass, isOpen, onToggle }) {
  const selectedClasses = properties.selectedClasses || {};

  const handleColorChange = (propertyKey, colorValue) => {
    addClass(propertyKey, colorValue);
  };

  const getColorValue = (propertyKey) => {
    const value = selectedClasses[propertyKey];
    if (!value || value === "transparent" || value === "") return null;
    return value;
  };

  return (
    <Section title="Color" icon={Palette} isOpen={isOpen} onToggle={onToggle}>
      <div className="space-y-6">
        {COLOR_PROPERTIES.map((property) => {
          const colorValue = getColorValue(property.key);

          return (
            <div key={property.key} className="space-y-2">
              <span className="text-xs font-medium text-[#71717a]">{property.label}</span>
              <ColorPicker
                value={colorValue || "#ffffff"}
                onChange={(value) => handleColorChange(property.key, value)}
              />
            </div>
          );
        })}
      </div>
    </Section>
  );
}
