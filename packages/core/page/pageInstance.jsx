import { Group, Rect, Text } from "react-konva";
import { useEditorStore } from "../stores/editorStore";

export function PageInstance({ page }) {
	const mode = useEditorStore((s) => s.mode);
	const selectedPageId = useEditorStore((s) => s.selectedPageId);
	const selectPage = useEditorStore((s) => s.selectPage);

	const isSelected = selectedPageId === page.id;

	return (
		<Group x={page.cx - page.width / 2} y={page.cy - page.height / 2}>
			{/* Page background — visual only */}
			<Rect
				width={page.width}
				height={page.height}
				fill="#0a0a0a"
				cornerRadius={4}
				listening={false}
			/>

			{/* Selection border — visual only */}
			{isSelected && (
				<Rect
					width={page.width}
					height={page.height}
					stroke="#facc15"
					strokeWidth={2}
					fillEnabled={false}
					listening={false}
				/>
			)}

			{/* Click catcher — MUST have a fill */}
			<Rect
				width={page.width}
				height={page.height}
				fill="transparent" // 🔑 THIS IS THE FIX
				onMouseDown={(e) => {
					if (mode !== "view") return;
					if (e.evt.button !== 0) return; // LEFT CLICK ONLY

					e.cancelBubble = true;
					selectPage(page.id);
				}}
			/>

			{/* Page label — visual only */}
			<Text
				text={page.name}
				x={8}
				y={-64}
				fontSize={60}
				fill="#aaa"
				listening={false}
			/>
		</Group>
	);
}
