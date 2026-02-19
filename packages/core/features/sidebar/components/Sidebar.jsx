import { useState } from 'react';
import { usePageStore } from '../../../stores/pageStore';
import { useEditorStore } from '../../../stores/editorStore';
import { useSidebarState } from '../hooks/useSidebarState';
import { SidebarHeader } from './SidebarHeader';
import { CollapsedIcons } from './CollapsedIcons';
import { ExpandedContent } from './ExpandedContent';
import { ResizeHandle } from './ResizeHandle';
import { DeleteModal } from './DeleteModal';

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
        className="fixed top-12 left-0 bottom-0 bg-[#111] border-r border-neutral-800 text-neutral-300 text-sm select-none z-40"
        style={{
          width,
          transition: isResizing ? 'none' : 'width 0.2s ease',
        }}
      >
        <SidebarHeader visuallyCollapsed={visuallyCollapsed} onToggle={toggleSidebar} />

        {visuallyCollapsed ? (
          <CollapsedIcons />
        ) : (
          <ExpandedContent
            pagesExpanded={pagesExpanded}
            onTogglePages={() => setPagesExpanded(!pagesExpanded)}
            layersExpanded={layersExpanded}
            onToggleLayers={() => setLayersExpanded(!layersExpanded)}
            pages={pages}
            selectedPageId={selectedPageId}
            onSelectPage={selectPage}
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
