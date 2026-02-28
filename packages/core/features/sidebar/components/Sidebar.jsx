import { useState, useCallback, useEffect } from 'react';
import { usePageStore } from '../../../stores/pageStore';
import { useEditorStore } from '../../../stores/editorStore';
import { useViewport } from '../../../stores/useViewport';
import { useSidebarState } from '../hooks/useSidebarState';
import { SidebarHeader } from './SidebarHeader';
import { CollapsedIcons } from './CollapsedIcons';
import { ExpandedContent } from './ExpandedContent';
import { ResizeHandle } from './ResizeHandle';
import { DeleteModal } from './DeleteModal';

const DEFAULT_ZOOM = 0.4;

export function Sidebar() {
  const {
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
  } = useSidebarState();

  const [creatingPage, setCreatingPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const pages = usePageStore((s) => s.pages);
  const selectedPageId = useEditorStore((s) => s.selectedPageId);
  const selectPage = useEditorStore((s) => s.selectPage);
  const mode = useEditorStore((s) => s.mode);
  const setLeftSidebarWidth = useEditorStore((s) => s.setLeftSidebarWidth);

  // Publish width so canvas overlays can avoid overlapping the sidebar
  // (Zoom indicator, etc.)
  useEffect(() => {
    setLeftSidebarWidth(width);
  }, [width, setLeftSidebarWidth]);

  const selectedPage = pages.find((p) => p.id === selectedPageId);
  const pageProperties = selectedPage || null;

  const handleSelectPage = useCallback(
    (pageId) => {
      selectPage(pageId);
    },
    [selectPage]
  );

  const handleFocusPage = useCallback(
    (pageId) => {
      if (mode !== 'view') return;

      const page = pages.find((p) => p.id === pageId);
      if (!page) return;

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const pageCenterX = page.cx ?? 0;
      const pageCenterY = page.cy ?? 0;

      const newX = screenWidth / 2 - pageCenterX * DEFAULT_ZOOM;
      const newY = screenHeight / 2 - pageCenterY * DEFAULT_ZOOM;

      useViewport.getState().setViewport(newX, newY, DEFAULT_ZOOM);
    },
    [pages, mode]
  );

  const handleCreatePage = () => {
    setCreatingPage(true);
    setNewPageName('');
  };

  const commitCreatePage = async () => {
    const trimmed = newPageName.trim();
    if (!trimmed) {
      setCreatingPage(false);
      return;
    }

    await fetch('/__pages/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    });

    setCreatingPage(false);
    setNewPageName('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    await fetch('/__pages/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: deleteTarget }),
    });

    setDeleteTarget(null);
  };

  return (
    <>
      <div
        ref={sidebarRef}
			data-left-sidebar
        className="fixed top-10 left-0 bottom-0 bg-black border-r border-[#1f1f1f] text-[#888] text-sm select-none z-40"
        style={{
          width,
          transition: isResizing ? 'none' : 'width 0.2s ease',
        }}
      >
        <SidebarHeader visuallyCollapsed={visuallyCollapsed} onToggle={toggleSidebar} />

        {visuallyCollapsed ? (
          <CollapsedIcons pageProperties={pageProperties} />
        ) : (
          <ExpandedContent
            pagesExpanded={pagesExpanded}
            onTogglePages={() => setPagesExpanded(!pagesExpanded)}
            layersExpanded={layersExpanded}
            onToggleLayers={() => setLayersExpanded(!layersExpanded)}
            pages={pages}
            selectedPageId={selectedPageId}
            onSelectPage={handleSelectPage}
            onFocusPage={handleFocusPage}
            onCreatePage={handleCreatePage}
            creatingPage={creatingPage}
            newPageName={newPageName}
            onNewPageNameChange={setNewPageName}
            onCommitCreatePage={commitCreatePage}
            onCancelCreatePage={() => setCreatingPage(false)}
            onDeletePage={(pageId) => setDeleteTarget(pageId)}
          />
        )}

        <ResizeHandle onMouseDown={startResize} />
      </div>

      {deleteTarget && (
        <DeleteModal
          pageName={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
