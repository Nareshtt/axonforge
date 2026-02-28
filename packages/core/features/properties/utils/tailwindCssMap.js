// tailwindCssMap.js
// Stable + category-aware conflict resolution

// ----------------------------------
// Resolve CSS properties (used ONLY for layout / spacing)
// ----------------------------------
export function resolveCssProperties(className) {
  if (!className) return [];

  if (/^w-/.test(className)) return ["width"];
  if (/^h-/.test(className)) return ["height"];
  if (/^min-w-/.test(className)) return ["min-width"];
  if (/^max-w-/.test(className)) return ["max-width"];
  if (/^min-h-/.test(className)) return ["min-height"];
  if (/^max-h-/.test(className)) return ["max-height"];

  if (/^(block|inline|flex|grid|hidden)$/.test(className)) return ["display"];
  if (/^(static|relative|absolute|fixed|sticky)$/.test(className)) return ["position"];
  if (/^top-/.test(className)) return ["top"];
  if (/^right-/.test(className)) return ["right"];
  if (/^bottom-/.test(className)) return ["bottom"];
  if (/^left-/.test(className)) return ["left"];
  if (/^justify-/.test(className)) return ["justify-content"];
  if (/^items-/.test(className)) return ["align-items"];

  if (/^p[trblxy]?[-[]/.test(className)) return ["padding"];
  if (/^m[trblxy]?[-[]/.test(className)) return ["margin"];

  if (/^bg-/.test(className)) return ["background"];
  if (/^border-/.test(className)) return ["border"];
  if (/^rounded/.test(className)) return ["border-radius"];

  if (/^opacity-/.test(className)) return ["opacity"];
  if (/^shadow/.test(className)) return ["box-shadow"];

  return [];
}

// ----------------------------------
// CATEGORY-BASED CONFLICT DETECTION
// ----------------------------------
export function getConflictingClasses(currentClasses, newCategory) {
  const conflicts = new Set();

  const keys = Object.keys(currentClasses);
  const add = (k) => {
    if (keys.includes(k)) conflicts.add(k);
  };

  // Exact-key conflict
  add(newCategory);

  // Padding / Margin conflict rules
  const padAll = ["p", "px", "py", "pt", "pr", "pb", "pl"];
  const marAll = ["m", "mx", "my", "mt", "mr", "mb", "ml"];

  if (padAll.includes(newCategory)) {
    // p overrides everything
    if (newCategory === "p") {
      padAll.forEach(add);
    }
    // px overrides pl/pr and p
    if (newCategory === "px") {
      ["p", "pl", "pr", "px"].forEach(add);
    }
    // py overrides pt/pb and p
    if (newCategory === "py") {
      ["p", "pt", "pb", "py"].forEach(add);
    }
    // individual sides override p + their axis shorthand
    if (newCategory === "pt" || newCategory === "pb") {
      ["p", "py", newCategory].forEach(add);
    }
    if (newCategory === "pl" || newCategory === "pr") {
      ["p", "px", newCategory].forEach(add);
    }
  }

  if (marAll.includes(newCategory)) {
    if (newCategory === "m") {
      marAll.forEach(add);
    }
    if (newCategory === "mx") {
      ["m", "ml", "mr", "mx"].forEach(add);
    }
    if (newCategory === "my") {
      ["m", "mt", "mb", "my"].forEach(add);
    }
    if (newCategory === "mt" || newCategory === "mb") {
      ["m", "my", newCategory].forEach(add);
    }
    if (newCategory === "ml" || newCategory === "mr") {
      ["m", "mx", newCategory].forEach(add);
    }
  }

  // Border: if user sets borderWidth, don't wipe borderColor (and vice versa)
  // (handled by exact-key conflict above)

  return Array.from(conflicts);
}
