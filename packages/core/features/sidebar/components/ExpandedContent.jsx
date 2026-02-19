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
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-800 text-neutral-400"
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

      <div className="h-px bg-neutral-800/50 mx-2" />

      <SidebarSection
        title="Layers"
        icon={<LayersIcon />}
        expanded={layersExpanded}
        onToggle={onToggleLayers}
      >
        <div className="px-3 py-1.5 text-neutral-500 text-sm">Coming soon</div>
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
