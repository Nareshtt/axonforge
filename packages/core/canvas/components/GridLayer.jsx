import { useEffect } from "react";
import { Graphics } from "pixi.js";
import { useViewport } from "../../stores/useViewport";

// Grid configuration
// Grid configuration
const LEVELS = [
	{ step: 50, color: 0xffffff, baseAlpha: 0.1, minScale: 0.4, maxScale: 5.0 }, // Level 1: Minor
	{ step: 250, color: 0xffffff, baseAlpha: 0.2, minScale: 0.1, maxScale: 5.0 }, // Level 2: Major
	{
		step: 1250,
		color: 0xffffff,
		baseAlpha: 0.3,
		minScale: 0.01,
		maxScale: 5.0,
	}, // Level 3: Mega
];

export function GridLayer({ app }) {
	const x = useViewport((s) => s.x);
	const y = useViewport((s) => s.y);
	const scale = useViewport((s) => s.scale);

	useEffect(() => {
		if (!app) return;

		// Find or create grid graphics
		let grid = app.stage.children.find((c) => c.label === "grid-layer");
		if (!grid) {
			grid = new Graphics();
			grid.label = "grid-layer";
			grid.zIndex = 10;
			grid.eventMode = "none";
			app.stage.addChild(grid);
		}

		grid.clear();

		const screenW = app.renderer.screen.width;
		const screenH = app.renderer.screen.height;

		// Calculate visible world bounds
		const worldLeft = (0 - x) / scale;
		const worldTop = (0 - y) / scale;
		const worldRight = (screenW - x) / scale;
		const worldBottom = (screenH - y) / scale;

		// Draw each level
		LEVELS.forEach((level) => {
			// Calculate opacity based on scale
			let alpha = level.baseAlpha;

			// Fade out if scaling down (zooming out) below minScale
			// Smooth transition window of 50% scale reduction
			if (scale < level.minScale) {
				alpha = 0;
			} else if (scale < level.minScale * 2) {
				const t = (scale - level.minScale) / level.minScale; // 0 to 1
				alpha *= t;
			}

			if (alpha <= 0.01) return;

			const step = level.step;

			// Snap start to grid
			const startX = Math.floor(worldLeft / step) * step;
			const startY = Math.floor(worldTop / step) * step;

			// Constant screen-space line width (1px)
			// width = 1 / scale
			const lineWidth = 1 / scale;

			// Draw Vertical Lines
			for (let i = startX; i <= worldRight; i += step) {
				grid.moveTo(i, worldTop).lineTo(i, worldBottom);
			}
			// Draw Horizontal Lines
			for (let j = startY; j <= worldBottom; j += step) {
				grid.moveTo(worldLeft, j).lineTo(worldRight, j);
			}

			grid.stroke({ width: lineWidth, color: level.color, alpha: alpha });
		});
	}, [app, scale, x, y]); // Re-draw on every transform change

	return null;
}
