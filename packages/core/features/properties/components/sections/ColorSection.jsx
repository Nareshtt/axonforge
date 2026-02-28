import { Palette } from "lucide-react";
import { Section } from "./Section";
import { ColorPicker } from "../ui";
import { Toggle } from "../ui";
import { useState } from "react";

function clampByte(n) {
  return Math.max(0, Math.min(255, n));
}

function toHex2(n) {
  return clampByte(n).toString(16).padStart(2, "0");
}

function rgbCssToHex8(css) {
  if (!css) return null;
  const m = css.match(/rgba?\(([^)]+)\)/i);
  if (!m) return null;
  const parts = m[1].split(",").map((s) => s.trim());
  const r = Number(parts[0]);
  const g = Number(parts[1]);
  const b = Number(parts[2]);
  const a = parts.length >= 4 ? Number(parts[3]) : 1;
  const alpha = Math.round(clampByte(a * 255));
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}${toHex2(alpha)}`.toUpperCase();
}

function normalizeHex8(hex) {
  if (!hex) return null;
  const h = hex.trim();
  if (!h.startsWith("#")) return null;
  if (h.length === 4) {
    // #RGB -> #RRGGBBFF
    const r = h[1];
    const g = h[2];
    const b = h[3];
    return `#${r}${r}${g}${g}${b}${b}FF`.toUpperCase();
  }
  if (h.length === 7) {
    return `${h}FF`.toUpperCase();
  }
  if (h.length === 9) {
    return h.toUpperCase();
  }
  return null;
}

function resolveTailwindClassToHex8(twClass, cssProp) {
  if (!twClass || !cssProp) return null;
  if (typeof document === "undefined") return null;

  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style.left = "-99999px";
  el.style.top = "-99999px";
  el.style.width = "1px";
  el.style.height = "1px";

  // For border colors, ensure there is a border width so computed color resolves.
  const cls = cssProp.startsWith("border") ? `${twClass} border border-solid` : twClass;
  el.className = cls;

  document.body.appendChild(el);
  const style = getComputedStyle(el);
  const css = style.getPropertyValue(cssProp);
  document.body.removeChild(el);

  return rgbCssToHex8(css);
}

const COLOR_PROPERTIES = [
  { key: "backgroundColor", label: "Background", prefix: "bg-" },
  { key: "textColor", label: "Text", prefix: "text-" },
  { key: "borderColor", label: "Border", prefix: "border-" },
  { key: "shadowColor", label: "Shadow", prefix: "shadow-" },
];

const PAGE_COLOR_PROPERTIES = [
  { key: "backgroundColor", label: "Background", prefix: "bg-" },
  { key: "textColor", label: "Text", prefix: "text-" },
];

function isGradient(value) {
  return typeof value === "string" && (
    value.includes("gradient") ||
    value.startsWith("linear-") ||
    value.startsWith("radial-") ||
    value.startsWith("conic-") ||
    value.startsWith("bg-linear") ||
    value.startsWith("bg-radial") ||
    value.startsWith("bg-conic") ||
    value.startsWith("bg-gradient")
  );
}

// Extract color value from Tailwind class for display
function extractColorValue(twClass) {
  if (!twClass) return "";

  // Arbitrary value: bg-[#ff0000], text-[#fff], etc.
  const bracketMatch = twClass.match(/\[(.+)\]/);
  if (bracketMatch) {
    return bracketMatch[1].replace(/_/g, " ");
  }

  // Standard Tailwind: text-red-500, bg-blue-500 -> red-500, blue-500
  const dashIndex = twClass.indexOf("-");
  if (dashIndex !== -1) {
    return twClass.slice(dashIndex + 1);
  }

  return twClass;
}

function toTailwindClass(prefix, value) {
  if (!value || value === "transparent" || value === "none") return "";

  // Gradient values from ColorPicker - convert spaces to underscores for Tailwind arbitrary values
  if (isGradient(value)) {
    const withUnderscores = value.replace(/\s+/g, "_");
    return `bg-[${withUnderscores}]`;
  }

  // Solid color
  if (value.startsWith(prefix)) return value;
  return `${prefix}[${value}]`;
}

function fromTailwindClass(value, prefix) {
  if (!value) return null;

  // Arbitrary values: bg-[...], text-[...]
  if (value.startsWith(prefix) && value.includes("[")) {
    const match = value.match(/\[(.+)\]/);
    if (match) {
      return match[1].replace(/_/g, " ");
    }
  }

  // Standard Tailwind class: bg-blue-500, text-white, etc.
  // Extract just the color part for display
  if (value.startsWith(prefix)) {
    return extractColorValue(value);
  }

  return null;
}

export function ColorSection({ sectionProperties: sectionProperties, addClass, isOpen, onToggle }) {
  const selectedClasses = sectionProperties?.selectedClasses || {};
  
  // Check if it's a page selection (no element selected = page mode)
  const isPage = !sectionProperties?.isElement;
  const colorProperties = isPage ? PAGE_COLOR_PROPERTIES : COLOR_PROPERTIES;

  const [lastValues, setLastValues] = useState({});

  const handleColorChange = (propertyKey, prefix, value) => {
    const classValue = toTailwindClass(prefix, value);
    addClass(propertyKey, classValue);

    if (value) {
      setLastValues((prev) => ({ ...prev, [propertyKey]: value }));
    }
  };

  const getColorValue = (propertyKey, prefix) => {
    const value = selectedClasses[propertyKey];
    if (!value) return null;

    const parsed = fromTailwindClass(value, prefix);
    if (parsed) {
      // gradients and arbitrary values
      if (isGradient(parsed)) return parsed;
      const norm = normalizeHex8(parsed);
      if (norm) return norm;
      // if parsed is not a hex (e.g. tailwind token), resolve via computed styles
    }

    // Resolve normal tailwind tokens like text-gray-400 -> #RRGGBBAA
    const cssProp =
      prefix === "text-"
        ? "color"
        : prefix === "bg-"
          ? "background-color"
          : prefix === "border-"
            ? "border-top-color"
            : "color";

    const resolved = resolveTailwindClassToHex8(value, cssProp);
    return resolved || null;
  };

  return (
    <Section title="Color" icon={Palette} isOpen={isOpen} onToggle={onToggle}>
      <div className="space-y-4">
        {colorProperties.map(({ key, label, prefix }) => {
          const colorValue = getColorValue(key, prefix);

            const enabled = !!selectedClasses[key];

            const defaultOnValue =
              lastValues[key] || (key === "backgroundColor" ? "#00000000" : "#FFFFFFFF");

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#71717a]">
                    {label}
                  </span>
                  <Toggle
                    value={enabled}
                    onChange={(v) => {
                      if (!v) {
                        handleColorChange(key, prefix, "");
                        return;
                      }
                      handleColorChange(key, prefix, defaultOnValue);
                    }}
                  />
                </div>
                <div className={enabled ? "" : "opacity-60 pointer-events-none"}>
                  <ColorPicker
                    value={colorValue || "#00000000"}
                    onChange={(value) => handleColorChange(key, prefix, value)}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </Section>
  );
}
