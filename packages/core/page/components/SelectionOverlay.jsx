import { useEffect, useMemo, useState } from "react";
import { useEditorStore } from "../../stores/editorStore";

function getElementByPath(container, path) {
	if (!container || !Array.isArray(path)) return null;
	let node = container.firstElementChild;
	if (!(node instanceof HTMLElement)) return null;
	for (const idx of path) {
		if (!node || !node.children) return null;
		node = node.children[idx];
	}
	return node instanceof HTMLElement ? node : null;
}

function rectToStyle(rect) {
	return {
		left: rect.left,
		top: rect.top,
		width: rect.width,
		height: rect.height,
	};
}

export function SelectionOverlay() {
	const mode = useEditorStore((s) => s.mode);
	const selectedPageId = useEditorStore((s) => s.selectedPageId);
	const selectedElementPath = useEditorStore((s) => s.selectedElementPath);
	const hoveredElementPath = useEditorStore((s) => s.hoveredElementPath);

	const [selectedRect, setSelectedRect] = useState(null);
	const [hoverRect, setHoverRect] = useState(null);

	const container = useMemo(() => {
		if (!selectedPageId) return null;
		return document.querySelector(`[data-editor-page-id="${selectedPageId}"]`);
	}, [selectedPageId]);

	useEffect(() => {
		if (mode !== "edit" || !container) {
			setSelectedRect(null);
			setHoverRect(null);
			return;
		}

		let raf = 0;
		const update = () => {
			const selPath =
				Array.isArray(selectedElementPath) && selectedElementPath.length > 0
					? selectedElementPath
					: null;
			const hovPath =
				Array.isArray(hoveredElementPath) && hoveredElementPath.length > 0
					? hoveredElementPath
					: null;
			const el = selPath ? getElementByPath(container, selPath) : null;
			const hoverEl = hovPath ? getElementByPath(container, hovPath) : null;

			setSelectedRect(el ? rectToStyle(el.getBoundingClientRect()) : null);
			setHoverRect(
				hoverEl && (!el || hoverEl !== el) ? rectToStyle(hoverEl.getBoundingClientRect()) : null
			);
		};

		const loop = () => {
			update();
			raf = window.requestAnimationFrame(loop);
		};
		loop();

		const onResize = () => update();
		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
			window.cancelAnimationFrame(raf);
		};
	}, [mode, container, selectedElementPath, hoveredElementPath]);

	if (mode !== "edit") return null;

	return (
		<div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
			{hoverRect && (
				<div
					style={{
						position: "fixed",
						...hoverRect,
						border: "1px solid rgba(99, 102, 241, 0.35)",
						borderRadius: 2,
						boxSizing: "border-box",
					}}
				/>
			)}
			{selectedRect && (
				<div
					style={{
						position: "fixed",
						...selectedRect,
						border: "1px solid rgba(99, 102, 241, 0.95)",
						borderRadius: 2,
						boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
						boxSizing: "border-box",
					}}
				/>
			)}
		</div>
	);
}
