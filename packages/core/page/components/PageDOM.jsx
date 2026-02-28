import { getPageModule } from "../utils/pageModules";
import { useEditorStore } from "../../stores/editorStore";
import { useEffect, useRef } from "react";

export function PageDOM({ page, viewport }) {
	const Mod = getPageModule(page.id);
	const selectPage = useEditorStore((s) => s.selectPage);
	const selectElementPath = useEditorStore((s) => s.selectElementPath);
	const setHoveredElementPath = useEditorStore((s) => s.setHoveredElementPath);
	const clearElementSelection = useEditorStore((s) => s.clearElementSelection);
	const selectedPageId = useEditorStore((s) => s.selectedPageId);
	const selectedElementPath = useEditorStore((s) => s.selectedElementPath);
	const mode = useEditorStore((s) => s.mode);
	const isSelected = selectedPageId === page.id;
	
	const containerRef = useRef(null);
	const debug = typeof window !== "undefined" && window.location.search.includes("debug=1");

	if (!Mod) {
		console.warn(`[PageDOM] Module not found for page "${page.id}"`);
		return null;
	}

	const { x, y, scale } = viewport;

	// World-to-screen: screen = stageOrigin + worldPos * scale
	// Page top-left in world space: (page.cx - page.width/2, page.cy - page.height/2)
	const screenX = x + (page.cx - page.width / 2) * scale;
	const screenY = y + (page.cy - page.height / 2) * scale;

	const getElementPath = (rootEl, el) => {
		if (!rootEl || !el) return null;
		if (el === rootEl) return [];
		const path = [];
		let node = el;
		while (node && node !== rootEl) {
			const parent = node.parentElement;
			if (!parent) return null;
			const idx = Array.prototype.indexOf.call(parent.children, node);
			if (idx < 0) return null;
			path.unshift(idx);
			node = parent;
		}
		return node === rootEl ? path : null;
	};

	const getElementByPath = (container, path) => {
		if (!container || !Array.isArray(path)) return null;
		let node = container;
		for (const idx of path) {
			if (!node || !node.children) return null;
			node = node.children[idx];
		}
		return node;
	};

	// In edit mode, select elements on pointerdown *capture* (figma-like).
	const getEventTargetElement = (e) => {
		const t = e?.target;
		if (t instanceof Element) return t;
		// Text node / other node types
		if (t && t.parentElement instanceof Element) return t.parentElement;
		if (t && t.parentNode instanceof Element) return t.parentNode;
		return null;
	};

	const handlePointerDownCapture = (e) => {
		if (mode !== "edit") return;
		if (!containerRef.current) return;

		const container = containerRef.current;
		const rootEl = container.firstElementChild;
		if (!(rootEl instanceof HTMLElement)) return;
		const base = getEventTargetElement(e);
		const targetEl = base ? base.closest("*") : null;
		if (!targetEl) return;
		if (!rootEl.contains(targetEl)) return;

		const path = getElementPath(rootEl, targetEl);
		if (!path) return;

		if (debug) {
			console.log("[select]", {
				pageId: page.id,
				targetTag: targetEl.tagName,
				targetClass: targetEl.getAttribute("class") || "",
				path,
			});
		}

		e.stopPropagation();
		selectPage(page.id);
		selectElementPath(path);
	};

	const handlePointerMoveCapture = (e) => {
		if (mode !== "edit") return;
		if (!containerRef.current) return;
		const container = containerRef.current;
		const rootEl = container.firstElementChild;
		if (!(rootEl instanceof HTMLElement)) return;
		const base = getEventTargetElement(e);
		const targetEl = base ? base.closest("*") : null;
		if (!targetEl || !rootEl.contains(targetEl)) {
			setHoveredElementPath(null);
			return;
		}
		const path = getElementPath(rootEl, targetEl);
		setHoveredElementPath(path);
	};

	// Handle page container pointerdown
	// - In view mode: allow selecting the page without blocking interactions inside the page
	// - In edit mode: select page and clear element selection (and stop propagation so canvas bg doesn't clear)
	const handlePagePointerDown = (e) => {
		if (mode === "edit") {
			// If this is an element click, capture handler already handled it.
			if (e.target !== containerRef.current) return;
			e.stopPropagation();
			selectPage(page.id);
			clearElementSelection();
			return;
		}

		// view mode
		selectPage(page.id);
	};

	// (Selection visuals are drawn by overlay; no DOM mutation here.)

	return (
		<div
			ref={containerRef}
			data-editor-page-id={page.id}
			onPointerDownCapture={handlePointerDownCapture}
			onPointerMoveCapture={handlePointerMoveCapture}
			onPointerDown={handlePagePointerDown}
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				transform: `translate(${screenX}px, ${screenY}px) scale(${scale})`,
				transformOrigin: "top left",
				width: page.width,
				height: page.height,
				overflow: "hidden",
				background: "white",
				pointerEvents: "auto",
				boxShadow: isSelected
					? mode === "edit"
						? "0 0 0 1px rgba(99, 102, 241, 0.9)"
						: "0 0 0 1px rgba(99, 102, 241, 0.55)"
					: "none",
				transition: "box-shadow 0.15s ease",
			}}
		>
			<Mod />
		</div>
	);
}
