import { useCallback, useEffect, useRef, useState } from 'react';

const ICON_RAIL_WIDTH = 48;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 256;
const STORAGE_KEY = 'axonforge:left-sidebar';

function loadSidebarState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSidebarState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useSidebarState() {
  const persisted = loadSidebarState();

  const [width, setWidth] = useState(persisted?.width ?? DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [pagesExpanded, setPagesExpanded] = useState(persisted?.pagesExpanded ?? true);
  const [layersExpanded, setLayersExpanded] = useState(persisted?.layersExpanded ?? true);

  const sidebarRef = useRef(null);
  const lastExpandedWidthRef = useRef(persisted?.lastExpandedWidth ?? DEFAULT_WIDTH);

  const saveState = useCallback(() => {
    saveSidebarState({
      width,
      lastExpandedWidth: lastExpandedWidthRef.current,
      pagesExpanded,
      layersExpanded,
    });
  }, [width, pagesExpanded, layersExpanded]);

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (e) => {
      if (!sidebarRef.current) return;
      const { left } = sidebarRef.current.getBoundingClientRect();
      const raw = e.clientX - left;
      const clamped = Math.max(ICON_RAIL_WIDTH, Math.min(MAX_WIDTH, raw));
      setWidth(clamped);
      if (clamped > ICON_RAIL_WIDTH) {
        lastExpandedWidthRef.current = clamped;
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      saveState();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, saveState]);

  const startResize = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
  }, []);

  const toggleSidebar = useCallback(() => {
    const nextWidth = width <= ICON_RAIL_WIDTH + 1
      ? lastExpandedWidthRef.current
      : ICON_RAIL_WIDTH;
    setWidth(nextWidth);
    saveState();
  }, [width, saveState]);

  const visuallyCollapsed = width <= ICON_RAIL_WIDTH + 1;

  return {
    width,
    isResizing,
    pagesExpanded,
    setPagesExpanded,
    layersExpanded,
    setLayersExpanded,
    sidebarRef,
    startResize,
    toggleSidebar,
    visuallyCollapsed,
  };
}
