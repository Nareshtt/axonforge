import { useState, useMemo, useEffect, useCallback } from "react";
import { useRightSidebarState } from "../hooks/useRightSidebarState";
import { useEditorStore } from "../../../stores/editorStore";
import { usePageStore } from "../../../stores/pageStore";
import { parseClassName, generateClassName } from "../utils/classNameUtils";
import { getConflictingClasses } from "../utils/tailwindCssMap";

import {
	Settings2,
	Download,
	Puzzle,
	Palette,
	Type,
	Ruler,
	LayoutGrid,
	Move,
	Sparkles,
} from "lucide-react";

import { Button } from "./ui/Button";
import {
	SizingSection,
	LayoutSection,
	PositionSection,
	TypographySection,
	SpacingSection,
	ColorSection,
	EffectsSection,
} from "./sections";

const PAGE_SECTION_ICONS = [
	{ key: "sizing", icon: Ruler, label: "Sizing" },
	{ key: "layout", icon: LayoutGrid, label: "Layout" },
	{ key: "spacing", icon: Move, label: "Spacing" },
	{ key: "typography", icon: Type, label: "Typography" },
	{ key: "color", icon: Palette, label: "Color" },
	{ key: "effects", icon: Sparkles, label: "Effects" },
];

function SidebarHeader({ isCollapsed, onToggle, mode, hasSelection, selectionType, elementLabel }) {
	return (
		<div
			className={[
				"h-12 flex items-center justify-between px-4",
				"border-b border-[#27272a] bg-[#09090b]",
				isCollapsed ? "justify-center" : "",
			].join(" ")}
		>
			{!isCollapsed && (
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<span className="text-sm font-semibold text-[#e4e4e7] tracking-tight">Properties</span>
						{mode === "edit" && (
							<span
								className={[
									"text-[10px] px-2 py-0.5 rounded-full font-medium",
									"transition-all duration-200",
									hasSelection
										? selectionType === "element"
											? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30"
											: "bg-[#6366f1]/20 text-[#a5b4fc] border border-[#6366f1]/30"
										: "bg-[#27272a] text-[#71717a] border border-[#3f3f46]",
								].join(" ")}
							>
								{selectionType === "element" ? elementLabel || "Element" : hasSelection ? "Page" : "None"}
							</span>
						)}
					</div>
				</div>
			)}
			<button
				onClick={onToggle}
				className={[
					"w-8 h-8 flex items-center justify-center",
					"text-[#71717a] hover:text-[#e4e4e7]",
					"hover:bg-[#27272a] rounded-lg",
					"transition-all duration-200",
				].join(" ")}
				title={isCollapsed ? "Expand Properties Panel" : "Collapse Properties Panel"}
			>
				<Settings2 size={16} />
			</button>
		</div>
	);
}

function CollapsedContent({ onSectionClick, focusedSection, availableSections }) {
	return (
		<div className="flex flex-col items-center gap-1 py-3">
			{availableSections.map(({ key, icon: Icon, label }) => (
				<button
					key={key}
					onClick={() => onSectionClick(key)}
					className={[
						"w-10 h-10 flex items-center justify-center",
						"rounded-lg transition-all duration-200 group relative",
						focusedSection === key
							? "bg-[#6366f1] text-white"
							: "text-[#6366f1] hover:bg-[#27272a] hover:text-[#e4e4e7]",
					].join(" ")}
					title={label}
				>
					<Icon size={18} />
					<span
						className={[
							"absolute left-full ml-2 px-2 py-1",
							"bg-[#18181b] text-xs text-[#e4e4e7] rounded",
							"opacity-0 group-hover:opacity-100",
							"transition-opacity duration-200 whitespace-nowrap",
							"border border-[#27272a]",
						].join(" ")}
					>
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
			className={[
				"absolute left-0 top-0 bottom-0 w-1",
				"cursor-col-resize group",
				"hover:bg-[#6366f1]/50 transition-colors duration-150",
			].join(" ")}
		>
			<div
				className={[
					"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
					"w-1 h-8 bg-[#3f3f46] rounded-full",
					"opacity-0 group-hover:opacity-100",
					"transition-opacity duration-150",
				].join(" ")}
			/>
		</div>
	);
}

function EmptyState({ mode, hasSelection }) {
	return (
		<div className="flex flex-col items-center justify-center h-48 text-center px-4">
			<div
				className={[
					"w-16 h-16 rounded-2xl bg-[#18181b] border border-[#27272a]",
					"flex items-center justify-center mb-4",
				].join(" ")}
			>
				<Puzzle size={24} className="text-[#52525b]" />
			</div>
			<h3 className="text-sm font-medium text-[#e4e4e7] mb-1">
				{hasSelection ? "No element selected" : "Select an element"}
			</h3>
			<p className="text-xs text-[#71717a] max-w-[180px]">
				{mode === "edit"
					? hasSelection
						? "Click an element to edit its styles"
						: "Click on a page to start editing"
					: "Switch to edit mode to modify styles"}
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
			<p className="text-[10px] text-[#52525b] text-center mt-2">Export current frame as image</p>
		</div>
	);
}

function getElementKind(tagName, inputType) {
	const t = (tagName || "").toLowerCase();
	if (!t) return "unknown";

	if (t === "a") return "link";
	if (t === "img") return "image";
	if (t === "button") return "button";
	if (t === "input") {
		if (inputType === "checkbox" || inputType === "radio") return "control";
		return "input";
	}
	if (t === "textarea" || t === "select") return "input";
	if (t === "p" || t === "span" || t === "label") return "text";
	if (t === "h1" || t === "h2" || t === "h3" || t === "h4" || t === "h5" || t === "h6") return "text";
	if (t === "ul" || t === "ol" || t === "li") return "list";
	if (t === "svg" || t === "path") return "vector";

	// Default to container-like
	return "container";
}

function getSectionsForKind(kind) {
	switch (kind) {
		case "text":
			return ["position", "typography", "color", "spacing", "effects"];
		case "link":
			return ["position", "typography", "color", "spacing", "effects"];
		case "image":
			return ["position", "sizing", "spacing", "effects"];
		case "button":
			return ["position", "layout", "typography", "color", "spacing", "effects", "sizing"];
		case "input":
			return ["position", "typography", "color", "spacing", "effects", "sizing"];
		case "list":
			return ["position", "typography", "color", "spacing", "layout"];
		case "vector":
			return ["position", "color", "effects", "sizing", "spacing"];
		case "container":
		default:
			return ["position", "sizing", "layout", "spacing", "color", "effects", "typography"];
	}
}

function SectionGroup({ title, sections, sectionProperties, addClass, focusedSection, onSectionToggle }) {
	const isSectionOpen = (key) => {
		return focusedSection ? focusedSection === key : true;
	};

	const handleSectionToggle = (key) => {
		if (focusedSection) {
			onSectionToggle(focusedSection === key ? null : key);
		} else {
			onSectionToggle(key);
		}
	};

	const renderSection = (key) => {
		switch (key) {
		case "sizing":
				return (
					<div data-section="sizing">
						<SizingSection
							sectionProperties={sectionProperties}
							updateProperty={() => {}}
							addClass={addClass}
							isOpen={isSectionOpen("sizing")}
							onToggle={() => handleSectionToggle("sizing")}
						/>
					</div>
				);
			case "position":
				return (
					<div data-section="position">
						<PositionSection
							sectionProperties={sectionProperties}
							addClass={addClass}
							addClasses={sectionProperties?.addClasses}
							isOpen={isSectionOpen("position")}
							onToggle={() => handleSectionToggle("position")}
						/>
					</div>
				);
			case "layout":
				return (
					<div data-section="layout">
						<LayoutSection
							sectionProperties={sectionProperties}
							addClass={addClass}
							isOpen={isSectionOpen("layout")}
							onToggle={() => handleSectionToggle("layout")}
						/>
					</div>
				);
			case "spacing":
				return (
					<div data-section="spacing">
						<SpacingSection
							sectionProperties={sectionProperties}
							addClass={addClass}
							isOpen={isSectionOpen("spacing")}
							onToggle={() => handleSectionToggle("spacing")}
						/>
					</div>
				);
			case "typography":
				return (
					<div data-section="typography">
						<TypographySection
							sectionProperties={sectionProperties}
							addClass={addClass}
							isOpen={isSectionOpen("typography")}
							onToggle={() => handleSectionToggle("typography")}
						/>
					</div>
				);
			case "color":
				return (
					<div data-section="color">
						<ColorSection
							sectionProperties={sectionProperties}
							addClass={addClass}
							isOpen={isSectionOpen("color")}
							onToggle={() => handleSectionToggle("color")}
						/>
					</div>
				);
			case "effects":
				return (
					<div data-section="effects">
						<EffectsSection
							sectionProperties={sectionProperties}
							addClass={addClass}
							isOpen={isSectionOpen("effects")}
							onToggle={() => handleSectionToggle("effects")}
						/>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="pb-4">
			<div className="px-4 pt-4 pb-2">
				<div className="text-[11px] font-semibold tracking-wide text-[#a1a1aa] uppercase">{title}</div>
			</div>
			<div className="px-4 space-y-4">
				{sections.map((key) => (
					<div key={key}>{renderSection(key)}</div>
				))}
			</div>
		</div>
	);
}

function PropertiesPanel({
	mode,
	hasSelection,
	selectionType,
	pageSectionProperties,
	elementSectionProperties,
	pageSections,
	elementSections,
	addPageClass,
	addElementClass,
	focusedSection,
	onSectionToggle,
}) {
	if (mode !== "edit" || !hasSelection) {
		return <EmptyState mode={mode} hasSelection={hasSelection} />;
	}

	if (selectionType === "page") {
		return (
			<div className="flex-1 overflow-y-auto pb-4">
				<SectionGroup
					title="Page"
					sections={pageSections}
					sectionProperties={pageSectionProperties}
					addClass={addPageClass}
					focusedSection={focusedSection}
					onSectionToggle={onSectionToggle}
				/>
				<ExportSection />
			</div>
		);
	}

	// Figma-like: properties always apply to the current selection.
	// To edit the page container, click empty space to select the page.
	return (
		<div className="flex-1 overflow-y-auto pb-4">
			<SectionGroup
				title="Selection"
				sections={elementSections}
				sectionProperties={elementSectionProperties}
				addClass={addElementClass}
				focusedSection={focusedSection}
				onSectionToggle={onSectionToggle}
			/>
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
	const selectedElementPath = useEditorStore((s) => s.selectedElementPath);
	const focusOnSidebar = useEditorStore((s) => s.focusOnSidebar);
	const debug = typeof window !== "undefined" && window.location.search.includes("debug=1");

	const pages = usePageStore((s) => s.pages);
	const selectedPage = useMemo(() => {
		if (selectedPageId) return pages.find((p) => p.id === selectedPageId) || null;
		return pages[0] || null;
	}, [selectedPageId, pages]);

	const hasSelection = selectedPageId !== null;
	const hasElementSelection = Array.isArray(selectedElementPath) && selectedElementPath.length > 0;
	const selectionType = hasElementSelection ? "element" : hasSelection ? "page" : null;

	const [pageClassName, setPageClassName] = useState("");
	const [elementClassName, setElementClassName] = useState("");
	const [elementInfo, setElementInfo] = useState(null);

	const loadSelectionContent = useCallback(async (pageId, elementPath) => {
		if (!pageId) return;
		try {
			if (debug) console.log("[sidebar] read", { pageId, elementPath });
			const response = await fetch("/__pages/read", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ pageId, elementPath: elementPath || undefined }),
			});

			if (!response.ok) return;
			const data = await response.json();
			if (debug) console.log("[sidebar] read:resp", data);
			setPageClassName(data.pageClassName || data.className || "");
			setElementClassName(data.elementClassName || "");
		} catch (err) {
			console.error("Failed to load page content:", err);
		}
	}, [debug]);

	useEffect(() => {
		if (!selectedPageId) return;
		loadSelectionContent(selectedPageId, hasElementSelection ? selectedElementPath : null);
	}, [selectedPageId, selectedElementPath, hasElementSelection, loadSelectionContent]);

	useEffect(() => {
		if (!hasElementSelection) {
			setElementInfo(null);
			return;
		}
		const container = selectedPageId
			? document.querySelector(`[data-editor-page-id="${selectedPageId}"]`)
			: null;
		let el = null;
		if (container && Array.isArray(selectedElementPath)) {
			let node = container.firstElementChild;
			for (const idx of selectedElementPath) {
				if (!node || !node.children) {
					node = null;
					break;
				}
				node = node.children[idx];
			}
			el = node;
		}
		if (!el) {
			setElementInfo({ tagName: "", inputType: "" });
			return;
		}

		setElementInfo({
			tagName: (el.tagName || "").toLowerCase(),
			inputType: (el.getAttribute("type") || "").toLowerCase(),
		});
	}, [hasElementSelection, selectedElementPath, selectedPageId]);

	const pageSelectedClasses = useMemo(() => parseClassName(pageClassName), [pageClassName]);
	const elementSelectedClasses = useMemo(
		() => parseClassName(elementClassName),
		[elementClassName]
	);

	const elementKind = useMemo(() => {
		if (!elementInfo) return "unknown";
		return getElementKind(elementInfo.tagName, elementInfo.inputType);
	}, [elementInfo]);

	const elementSections = useMemo(() => getSectionsForKind(elementKind), [elementKind]);
	const pageSections = useMemo(() => ["sizing", "layout", "spacing", "typography", "color", "effects"], []);

	const elementLabel = useMemo(() => {
		if (selectionType !== "element") return "";
		const tag = elementInfo?.tagName ? elementInfo.tagName : "element";
		return tag;
	}, [selectionType, elementInfo]);

	const pageSectionProperties = useMemo(
		() => ({
			selectedClasses: pageSelectedClasses,
			isElement: false,
			width: selectedPage?.width || 1920,
			height: selectedPage?.height || 1080,
		}),
		[pageSelectedClasses, selectedPage]
	);

	const elementSectionProperties = useMemo(
		() => ({
			selectedClasses: elementSelectedClasses,
			isElement: true,
			tagName: elementInfo?.tagName || "",
			width: selectedPage?.width || 1920,
			height: selectedPage?.height || 1080,
		}),
		[elementSelectedClasses, elementInfo, selectedPage]
	);

	const writeClassNamesBatch = useCallback(
		async ({ target, updates }) => {
			if (!selectedPageId) return;
			if (target === "element" && !hasElementSelection) return;
			if (!updates || typeof updates !== "object") return;

			const current = target === "page" ? pageClassName : elementClassName;
			const rawList = (current || "").split(/\s+/).filter(Boolean);
			const currentClasses = current ? parseClassName(current) : {};
			const knownSet = new Set(Object.values(currentClasses).filter(Boolean));
			const unknownClasses = rawList.filter((c) => !knownSet.has(c));
			const next = { ...currentClasses };

			for (const [category, className] of Object.entries(updates)) {
				const conflicts = getConflictingClasses(next, category);
				for (const key of conflicts) delete next[key];
				if (className) next[category] = className;
				else delete next[category];
			}

			const knownClassName = generateClassName(next);
			const newClassName = [knownClassName, ...unknownClasses].filter(Boolean).join(" ").trim();

			if (debug) {
				console.log("[sidebar] write:batch", {
					target,
					pageId: selectedPageId,
					elementPath: target === "element" ? selectedElementPath : null,
					updates,
					newClassName,
				});
			}

			try {
				const response = await fetch("/__pages/update", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						pageId: selectedPageId,
						elementPath: target === "element" ? selectedElementPath : undefined,
						className: newClassName,
					}),
				});
				await response.json().catch(() => null);
				if (target === "page") setPageClassName(newClassName);
				else setElementClassName(newClassName);
			} catch (err) {
				console.error("Failed to update className (batch):", err);
			}
		},
		[debug, selectedPageId, selectedElementPath, hasElementSelection, pageClassName, elementClassName]
	);

	const addElementClasses = useCallback(
		(updates) => writeClassNamesBatch({ target: "element", updates }),
		[writeClassNamesBatch]
	);

	const elementSectionPropertiesForPanel = useMemo(
		() => ({
			...elementSectionProperties,
			addClasses: addElementClasses,
		}),
		[elementSectionProperties, addElementClasses]
	);

	const writeClassName = useCallback(
		async ({ target, category, className }) => {
			if (!selectedPageId) return;
			if (target === "element" && !hasElementSelection) return;

			const current = target === "page" ? pageClassName : elementClassName;
			const rawList = (current || "").split(/\s+/).filter(Boolean);
			const currentClasses = current ? parseClassName(current) : {};
			const knownSet = new Set(Object.values(currentClasses).filter(Boolean));
			const unknownClasses = rawList.filter((c) => !knownSet.has(c));
			const next = { ...currentClasses };

			const conflicts = getConflictingClasses(next, category);
			for (const key of conflicts) delete next[key];

			if (className) next[category] = className;
			else delete next[category];

			const knownClassName = generateClassName(next);
			const newClassName = [knownClassName, ...unknownClasses].filter(Boolean).join(" ").trim();

			try {
				if (debug) {
					console.log("[sidebar] write", {
						target,
						pageId: selectedPageId,
						elementPath: target === "element" ? selectedElementPath : null,
						category,
						className,
						newClassName,
					});
				}
				const response = await fetch("/__pages/update", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						pageId: selectedPageId,
						elementPath: target === "element" ? selectedElementPath : undefined,
						className: newClassName,
					}),
				});
				const _data = await response.json().catch(() => null);
				// Content is updated on disk; UI derives from className state.
				if (target === "page") setPageClassName(newClassName);
				else setElementClassName(newClassName);
			} catch (err) {
				console.error("Failed to update className:", err);
			}
		},
		[debug, selectedPageId, selectedElementPath, hasElementSelection, pageClassName, elementClassName]
	);

	const addPageClass = useCallback(
		(category, className) => writeClassName({ target: "page", category, className }),
		[writeClassName]
	);

	const addElementClass = useCallback(
		(category, className) => writeClassName({ target: "element", category, className }),
		[writeClassName]
	);

	const [focusedSection, setFocusedSection] = useState(null);

	useEffect(() => {
		if (isCollapsed) setFocusedSection(null);
	}, [isCollapsed]);

	const handleSectionClick = (key) => {
		if (isCollapsed) {
			setFocusedSection(key);
			toggleSidebar();
			setTimeout(() => {
				const container = document.querySelector('[data-sidebar] .flex-1.overflow-y-auto');
				const sectionElement = document.querySelector(`[data-section="${key}"]`);
				if (container && sectionElement) {
					container.scrollTo({ top: sectionElement.offsetTop, behavior: "smooth" });
				}
			}, 300);
			return;
		}

		setFocusedSection(focusedSection === key ? null : key);
		if (focusedSection !== key) {
			setTimeout(() => {
				const container = document.querySelector('[data-sidebar] .flex-1.overflow-y-auto');
				const sectionElement = document.querySelector(`[data-section="${key}"]`);
				if (container && sectionElement) {
					container.scrollTo({ top: sectionElement.offsetTop, behavior: "smooth" });
				}
			}, 50);
		}
	};

	const handleSidebarClick = (e) => {
		e.stopPropagation();
		focusOnSidebar();
	};

	const handleSidebarMouseEnter = () => {
		focusOnSidebar();
	};

	const shouldShowSidebar = mode === "edit" && hasSelection;
	if (!shouldShowSidebar) return null;

	const collapsedSections = PAGE_SECTION_ICONS;

	return (
		<div
			ref={sidebarRef}
			data-sidebar
			className={[
				"fixed top-10 right-0 bottom-0",
				"bg-[#09090b] border-l border-[#27272a]",
				"text-[#a1a1aa] text-sm select-none",
				"z-40 flex flex-col",
			].join(" ")}
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
				selectionType={selectionType}
				elementLabel={elementLabel}
			/>

			{isCollapsed ? (
				<CollapsedContent
					onSectionClick={handleSectionClick}
					focusedSection={focusedSection}
					availableSections={collapsedSections}
				/>
			) : (
				<PropertiesPanel
					mode={mode}
					hasSelection={hasSelection}
					selectionType={selectionType}
					pageSectionProperties={pageSectionProperties}
					elementSectionProperties={elementSectionPropertiesForPanel}
					pageSections={pageSections}
					elementSections={elementSections}
					addPageClass={addPageClass}
					addElementClass={addElementClass}
					focusedSection={focusedSection}
					onSectionToggle={handleSectionClick}
				/>
			)}

			<ResizeHandle onMouseDown={startResize} />
		</div>
	);
}
