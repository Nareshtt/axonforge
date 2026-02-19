import { DEFAULT_PRESET, PAGE_SPACING } from '../config/presets';

export function buildPageDescriptors(pages) {
  let cursorX = 0;

  return pages.map((page) => ({
    ...page,
    width: DEFAULT_PRESET.width,
    height: DEFAULT_PRESET.height,
    x: cursorX,
    y: 0,
    cursorX: cursorX + DEFAULT_PRESET.width + PAGE_SPACING,
  }));
}

export function initializePageWithPreset(page) {
  return {
    ...page,
    width: DEFAULT_PRESET.width,
    height: DEFAULT_PRESET.height,
    cx: 0,
    cy: 0,
  };
}

export function staggerPages(pages) {
  const spacing = PAGE_SPACING;
  let cursorX = 0;

  return pages.map((page) => {
    const staggeredPage = {
      ...page,
      width: page.width || DEFAULT_PRESET.width,
      height: page.height || DEFAULT_PRESET.height,
      cx: cursorX,
      cy: 0,
    };

    cursorX += staggeredPage.width + spacing;
    return staggeredPage;
  });
}
