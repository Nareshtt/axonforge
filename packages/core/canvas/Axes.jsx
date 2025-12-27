import { Line, Circle } from "react-konva";

export function Axes({ size = 5000 }) {
	return (
		<>
			{/* X AXIS (red) */}
			<Line
				points={[-size, 0, size, 0]}
				stroke="#ef4444" // red-500
				strokeWidth={2}
			/>

			{/* Y AXIS (green) */}
			<Line
				points={[0, -size, 0, size]}
				stroke="#22c55e" // green-500
				strokeWidth={2}
			/>

			{/* ORIGIN (yellow dot) */}
			<Circle
				x={0}
				y={0}
				radius={5}
				fill="#eab308" // yellow-500
			/>
		</>
	);
}
