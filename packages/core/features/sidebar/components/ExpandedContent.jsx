import { ChevronDown, FileText, Layers, Plus } from 'lucide-react';
import { SidebarSection } from './SidebarSection';
import { PageItem } from './PageItem';
import { NewPageInput } from './NewPageInput';

export function ExpandedContent({
  pagesExpanded,
  onTogglePages,
  layersExpanded,
  onToggleLayers,
  pages,
  selectedPageId,
  onSelectPage,
  onFocusPage,
  onCreatePage,
  creatingPage,
  newPageName,
  onNewPageNameChange,
  onCommitCreatePage,
  onCancelCreatePage,
  onDeletePage,
}) {
  return (
    <div className="overflow-y-auto h-full">
      <SidebarSection
        title="Pages"
        icon={<FileTextIcon />}
        expanded={pagesExpanded}
        onToggle={onTogglePages}
        rightAction={
          <button
            onClick={onCreatePage}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#1a1a1a] text-[#666] hover:text-white transition-colors"
            title="Add Page"
          >
            <PlusIcon />
          </button>
        }
      >
        {pages.map((page) => (
          <PageItem
            key={page.id}
            page={page}
            active={page.id === selectedPageId}
            onSelect={() => onSelectPage(page.id)}
            onDoubleClick={() => onFocusPage(page.id)}
            onDelete={() => onDeletePage(page.id)}
          />
        ))}

        {creatingPage && (
          <NewPageInput
            value={newPageName}
            onChange={onNewPageNameChange}
            onBlur={onCancelCreatePage}
            onEnter={onCommitCreatePage}
            onEscape={onCancelCreatePage}
          />
        )}
      </SidebarSection>

      <div className="h-px bg-[#1f1f1f] mx-2" />

      <SidebarSection
        title="Layers"
        icon={<LayersIcon />}
        expanded={layersExpanded}
        onToggle={onToggleLayers}
      >
        <div className="px-3 py-1.5 text-[#444] text-xs">Coming soon</div>
      </SidebarSection>
    </div>
  );
}

function FileTextIcon() {
  return <FileText size={14} />;
}

function LayersIcon() {
  return <Layers size={14} />;
}

function PlusIcon() {
  return <Plus size={14} />;
}
