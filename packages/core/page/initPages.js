import { usePageStore } from '../stores/pageStore';
import { DEFAULT_PRESET, PAGE_SPACING } from './config/presets';
import { loadPagePositions, cleanupPagePositions, savePagePositions } from '../stores/localStorageState';

function getRightmostPosition(pages) {
  if (!pages || pages.length === 0) {
    return 0;
  }

  let max = 0;
  for (const page of pages) {
    if (page && typeof page.cx === 'number' && page.cx > max) {
      max = page.cx;
    }
  }
  return max + DEFAULT_PRESET.width + PAGE_SPACING;
}

export async function initPages() {
  const res = await fetch('/__pages');
  const fsPages = await res.json();

  const savedPages = usePageStore.getState().pages;
  
  const fsPageIds = new Set(fsPages.map(p => p.id));
  const validSavedPages = savedPages.filter(p => fsPageIds.has(p.id));

  const pages = fsPages.map((page) => {
    const saved = validSavedPages.find(p => p.id === page.id);

    if (saved && saved.cx !== undefined) {
      return {
        ...page,
        width: saved.width || DEFAULT_PRESET.width,
        height: saved.height || DEFAULT_PRESET.height,
        cx: saved.cx,
        cy: saved.cy ?? 0,
      };
    }

    const nextCx = getRightmostPosition(validSavedPages);

    return {
      ...page,
      width: DEFAULT_PRESET.width,
      height: DEFAULT_PRESET.height,
      cx: nextCx,
      cy: 0,
    };
  });

  usePageStore.getState().setPages(pages);

  if (import.meta.hot) {
    import.meta.hot.on('pages:update', (newFsPages) => {
      const newFsPageIds = new Set(newFsPages.map(p => p.id));
      
      cleanupPagePositions(newFsPageIds);
      
      usePageStore.setState((state) => {
        const existingPages = state.pages.filter(p => newFsPageIds.has(p.id));
        
        const merged = newFsPages.map((fsPage) => {
          const existing = existingPages.find(p => p.id === fsPage.id);

          if (existing && existing.cx !== undefined) {
            return {
              ...fsPage,
              width: existing.width || DEFAULT_PRESET.width,
              height: existing.height || DEFAULT_PRESET.height,
              cx: existing.cx,
              cy: existing.cy ?? 0,
            };
          }

          const nextCx = getRightmostPosition(existingPages);

          return {
            ...fsPage,
            width: DEFAULT_PRESET.width,
            height: DEFAULT_PRESET.height,
            cx: nextCx,
            cy: 0,
          };
        });

        return { pages: merged };
      });

      usePageStore.getState().updateTransforms();
      savePagePositions(usePageStore.getState().pages);
    });
  }
}

export { PageDOM } from './components/PageDOM';
export { PageDOMRoot } from './components/PageDOMRoot';
