import { Line } from "react-konva";

export default function Grid({ size = 5000, step = 50 }) {
	const lines = [];

	for (let i = -size; i <= size; i += step) {
		// vertical grid lines
		lines.push(
			<Line
				key={`v-${i}`}
				points={[i, -size, i, size]}
				stroke="#222"
				strokeWidth={1}
			/>
		);

		// horizontal grid lines
		lines.push(
			<Line
				key={`h-${i}`}
				points={[-size, i, size, i]}
				stroke="#222"
				strokeWidth={1}
			/>
		);
	}

	return <>{lines}</>;
}
