import { Group, Rect, Text } from "react-konva";

export function PageInstance({ page }) {
	// Use logical workspace coordinates directly
	// Konva's Stage transform handles the viewport transformation
	return (
		<Group x={page.cx - page.width / 2} y={page.cy - page.height / 2}>
			{/* Page background */}
			<Rect
				x={0}
				y={0}
				width={page.width}
				height={page.height}
				fill="#0a0a0a"
				cornerRadius={4}
			/>

			{/* Page label (editor-only) */}
			<Text text={page.name} x={0} y={-64} fontSize={60} fill="#aaa" />
		</Group>
	);
}
