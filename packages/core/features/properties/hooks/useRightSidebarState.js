import { useCallback, useState } from 'react';

const ICON_RAIL_WIDTH = 48;
const DEFAULT_WIDTH = 280;
const STORAGE_KEY = 'axonforge:right-sidebar';

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

export function useRightSidebarState() {
  const persisted = loadSidebarState();

  const isCollapsedFromStorage = persisted?.isCollapsed ?? false;

  const [width, setWidth] = useState(isCollapsedFromStorage ? ICON_RAIL_WIDTH : DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(isCollapsedFromStorage);

  const sidebarRef = useCallback((node) => {
    if (node !== null) {
      sidebarRef.current = node;
    }
  }, []);

  const saveState = useCallback((collapsedToSave) => {
    saveSidebarState({
      isCollapsed: collapsedToSave,
      width: collapsedToSave ? ICON_RAIL_WIDTH : DEFAULT_WIDTH,
    });
  }, []);

  const startResize = useCallback((e) => {
    e.preventDefault();
  }, []);

  const toggleSidebar = useCallback(() => {
    const nextCollapsed = !isCollapsed;
    setIsCollapsed(nextCollapsed);
    if (nextCollapsed) {
      setWidth(ICON_RAIL_WIDTH);
    } else {
      setWidth(DEFAULT_WIDTH);
    }
    saveState(nextCollapsed);
  }, [isCollapsed, saveState]);

  return {
    width,
    isResizing: false,
    sidebarRef,
    startResize,
    toggleSidebar,
    isCollapsed,
  };
}
