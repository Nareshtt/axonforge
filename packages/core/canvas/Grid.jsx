import { Line } from "react-konva";

export default function Grid({ size = 5000, step = 50 }) {
	const lines = [];

	for (let i = -size; i <= size; i += step) {
		const isMainLine = i % (step * 5) === 0;

		// vertical grid lines
		lines.push(
			<Line
				key={`v-${i}`}
				points={[i, -size, i, size]}
				stroke={isMainLine ? "#4a5159" : "#2d3139"}
				strokeWidth={isMainLine ? 1.5 : 1}
				opacity={isMainLine ? 0.6 : 0.4}
				listening={false}
			/>
		);

		// horizontal grid lines
		lines.push(
			<Line
				key={`h-${i}`}
				points={[-size, i, size, i]}
				stroke={isMainLine ? "#4a5159" : "#2d3139"}
				strokeWidth={isMainLine ? 1.5 : 1}
				opacity={isMainLine ? 0.6 : 0.4}
				listening={false}
			/>
		);
	}

	return <>{lines}</>;
}
