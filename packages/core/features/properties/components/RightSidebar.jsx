import { useState, useMemo } from "react";
import { useRightSidebarState } from "../hooks/useRightSidebarState";
import { useEditorStore } from "../../../stores/editorStore";
import { usePageStore } from "../../../stores/pageStore";
import {
  Layers,
  Type,
  Image,
  Settings2,
  Download,
  Puzzle,
  Palette,
  Maximize2,
  Sparkles,
} from "lucide-react";

import { Button } from "./ui/Button";
import {
  SizingSection,
  LayoutSection,
  TypographySection,
  SpacingSection,
  EffectsSection,
} from "./sections";

function SidebarHeader({ isCollapsed, onToggle, mode, hasSelection }) {
  return (
    <div
      className={`
        h-12 flex items-center justify-between px-4 
        border-b border-[#27272a] bg-[#09090b]
        ${isCollapsed ? "justify-center" : ""}
      `}
    >
      {!isCollapsed && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#e4e4e7] tracking-tight">
              Properties
            </span>
            {mode === "edit" && (
              <span
                className={`
                  text-[10px] px-2 py-0.5 rounded-full font-medium
                  transition-all duration-200
                  ${hasSelection
                    ? "bg-[#6366f1]/20 text-[#a5b4fc] border border-[#6366f1]/30"
                    : "bg-[#27272a] text-[#71717a] border border-[#3f3f46]"
                  }
                `}
              >
                {hasSelection ? "Element" : "Page"}
              </span>
            )}
          </div>
        </div>
      )}
      <button
        onClick={onToggle}
        className="
          w-8 h-8 flex items-center justify-center
          text-[#71717a] hover:text-[#e4e4e7]
          hover:bg-[#27272a] rounded-lg
          transition-all duration-200
        "
        title={isCollapsed ? "Expand Properties Panel" : "Collapse Properties Panel"}
      >
        <Settings2 size={16} />
      </button>
    </div>
  );
}

function CollapsedContent() {
  return (
    <div className="flex flex-col items-center gap-1 py-3">
      {[
        { icon: Layers, label: "Layers" },
        { icon: Type, label: "Typography" },
        { icon: Image, label: "Appearance" },
      ].map(({ icon: Icon, label }) => (
        <button
          key={label}
          className="
            w-10 h-10 flex items-center justify-center
            text-[#71717a] hover:text-[#e4e4e7]
            hover:bg-[#27272a] rounded-lg
            transition-all duration-200
            group relative
          "
          title={label}
        >
          <Icon size={18} />
          <span className="
            absolute left-full ml-2 px-2 py-1 
            bg-[#18181b] text-xs text-[#e4e4e7] rounded
            opacity-0 group-hover:opacity-100 
            transition-opacity duration-200 whitespace-nowrap
            border border-[#27272a]
          ">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

function ResizeHandle({ onMouseDown }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="
        absolute left-0 top-0 bottom-0 w-1
        cursor-col-resize group
        hover:bg-[#6366f1]/50 transition-colors duration-150
      "
    >
      <div className="
        absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        w-1 h-8 bg-[#3f3f46] rounded-full
        opacity-0 group-hover:opacity-100
        transition-opacity duration-150
      " />
    </div>
  );
}

function EmptyState({ mode, hasSelection }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center px-4">
      <div className="
        w-16 h-16 rounded-2xl bg-[#18181b] border border-[#27272a]
        flex items-center justify-center mb-4
      ">
        <Puzzle size={24} className="text-[#52525b]" />
      </div>
      <h3 className="text-sm font-medium text-[#e4e4e7] mb-1">
        {hasSelection ? "No element selected" : "Select an element"}
      </h3>
      <p className="text-xs text-[#71717a] max-w-[180px]">
        {mode === "edit"
          ? hasSelection
            ? "Click on an element in the canvas to edit its properties"
            : "Click on any element to start editing"
          : "Switch to edit mode to modify properties"
        }
      </p>
    </div>
  );
}

function ExportSection() {
  return (
    <div className="px-4 py-4 border-t border-[#27272a]">
      <Button variant="primary" className="w-full justify-center">
        <Download size={14} />
        Export as PNG
      </Button>
      <p className="text-[10px] text-[#52525b] text-center mt-2">
        Export current frame as image
      </p>
    </div>
  );
}

function PropertiesPanel({ selectedPage, mode, hasSelection, properties, updateProperty, addClass }) {
  if (mode !== "edit" || !hasSelection) {
    return <EmptyState mode={mode} hasSelection={hasSelection} />;
  }

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <SizingSection
        properties={properties}
        updateProperty={updateProperty}
        addClass={addClass}
      />
      <LayoutSection properties={properties} addClass={addClass} />
      <SpacingSection properties={properties} addClass={addClass} />
      <TypographySection properties={properties} addClass={addClass} />
      <EffectsSection properties={properties} addClass={addClass} />
      <ExportSection />
    </div>
  );
}

export function RightSidebar() {
  const {
    width,
    isResizing,
    sidebarRef,
    startResize,
    toggleSidebar,
    isCollapsed,
  } = useRightSidebarState();

  const mode = useEditorStore((s) => s.mode);
  const selectedPageId = useEditorStore((s) => s.selectedPageId);
  const pages = usePageStore((s) => s.pages);
  const focusOnSidebar = useEditorStore((s) => s.focusOnSidebar);

  const selectedPage = useMemo(() => {
    if (selectedPageId) {
      return pages.find((p) => p.id === selectedPageId);
    }
    return pages[0] || null;
  }, [selectedPageId, pages]);

  const hasSelection = selectedPageId !== null;

  const [properties, setProperties] = useState({
    name: selectedPage?.name || "Page",
    x: selectedPage?.cx || 0,
    y: selectedPage?.cy || 0,
    width: selectedPage?.width || 1920,
    height: selectedPage?.height || 1080,
    selectedClasses: {},
  });

  const updateProperty = (key, value) => {
    setProperties((prev) => ({ ...prev, [key]: value }));
  };

  const addClass = (category, className) => {
    setProperties((prev) => ({
      ...prev,
      selectedClasses: {
        ...prev.selectedClasses,
        [category]: className,
      },
    }));
  };

  const handleSidebarClick = (e) => {
    e.stopPropagation();
    focusOnSidebar();
  };

  const handleSidebarMouseEnter = () => {
    focusOnSidebar();
  };

  return (
    <div
      ref={sidebarRef}
      data-sidebar
      className="
        fixed top-10 right-0 bottom-0
        bg-[#09090b] border-l border-[#27272a]
        text-[#a1a1aa] text-sm select-none
        z-40 flex flex-col
      "
      style={{
        width,
        transition: isResizing ? "none" : "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onClick={handleSidebarClick}
      onMouseEnter={handleSidebarMouseEnter}
    >
      <SidebarHeader
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
        mode={mode}
        hasSelection={hasSelection}
      />

      {isCollapsed ? (
        <CollapsedContent />
      ) : (
        <PropertiesPanel
          selectedPage={selectedPage}
          mode={mode}
          hasSelection={hasSelection}
          properties={properties}
          updateProperty={updateProperty}
          addClass={addClass}
        />
      )}

      <ResizeHandle onMouseDown={startResize} />
    </div>
  );
}
