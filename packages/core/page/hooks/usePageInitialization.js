import { useCallback } from 'react';
import { usePageStore } from '../../stores/pageStore';
import { DEFAULT_PRESET, PAGE_SPACING } from '../config/presets';
import { staggerPages } from '../utils/pageBuilder';

export function usePageInitialization() {
  const setPages = usePageStore((s) => s.setPages);
  const updateTransforms = usePageStore((s) => s.updateTransforms);

  const initializePages = useCallback(async () => {
    const res = await fetch('/__pages');
    const registry = await res.json();

    const pagesWithPosition = registry.map((page, index) => ({
      ...page,
      width: DEFAULT_PRESET.width,
      height: DEFAULT_PRESET.height,
      cx: index * (DEFAULT_PRESET.width + PAGE_SPACING),
      cy: 0,
    }));

    setPages(pagesWithPosition);
  }, [setPages]);

  return { initializePages };
}
