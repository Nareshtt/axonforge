import { getPageModule } from "../utils/pageModules";
import { useEditorStore } from "../../stores/editorStore";

export function PageDOM({ page, viewport }) {
	const Mod = getPageModule(page.id);
	const selectPage = useEditorStore((s) => s.selectPage);
	const selectedPageId = useEditorStore((s) => s.selectedPageId);
	const isSelected = selectedPageId === page.id;

	if (!Mod) {
		console.warn(`[PageDOM] Module not found for page "${page.id}"`);
		return null;
	}

	const { x, y, scale } = viewport;

	// World-to-screen: screen = stageOrigin + worldPos * scale
	// Page top-left in world space: (page.cx - page.width/2, page.cy - page.height/2)
	const screenX = x + (page.cx - page.width / 2) * scale;
	const screenY = y + (page.cy - page.height / 2) * scale;

	return (
		<div
			onPointerDown={(e) => {
				e.stopPropagation();
				selectPage(page.id);
			}}
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
				boxShadow: isSelected ? "0 0 0 6px #6366f1, 0 0 15px rgba(99, 102, 241, 0.4)" : "none",
				transition: "box-shadow 0.15s ease",
			}}
		>
			<Mod />
		</div>
	);
}
