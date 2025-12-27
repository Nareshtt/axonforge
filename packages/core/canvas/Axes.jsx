// Update Axes.jsx to show visual feedback
import { Line, Circle } from "react-konva";
import { useEditorStore } from "../stores/editorStore";

export function Axes({ size = 5000 }) {
	const axisConstraint = useEditorStore((s) => s.axisConstraint);
	const isMoving = useEditorStore((s) => s.isMoving);

	// Calculate opacity based on constraint
	const xOpacity =
		isMoving && axisConstraint ? (axisConstraint === "x" ? 1 : 0.3) : 1;
	const yOpacity =
		isMoving && axisConstraint ? (axisConstraint === "y" ? 1 : 0.3) : 1;

	return (
		<>
			{/* X AXIS (red) */}
			<Line
				points={[-size, 0, size, 0]}
				stroke="#ef4444"
				strokeWidth={axisConstraint === "x" ? 3 : 2}
				opacity={xOpacity}
			/>

			{/* Y AXIS (green) */}
			<Line
				points={[0, -size, 0, size]}
				stroke="#22c55e"
				strokeWidth={axisConstraint === "y" ? 3 : 2}
				opacity={yOpacity}
			/>

			{/* ORIGIN (yellow dot) */}
			<Circle x={0} y={0} radius={5} fill="#eab308" />
		</>
	);
}
