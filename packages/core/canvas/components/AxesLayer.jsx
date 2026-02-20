import { useEffect, useRef } from "react";
import { Graphics } from "pixi.js";

const AXIS_COLOR_X = 0xf87171; // Red-400
const AXIS_COLOR_Y = 0x4ade80; // Green-400
const ORIGIN_COLOR = 0x818cf8; // Indigo-400
const AXIS_WIDTH = 3;
const ORIGIN_RADIUS = 6;
const CONSTRAINED_ALPHA = 0.2;
const FULL_ALPHA = 1;
const AXIS_LENGTH = 100000;
const BUFFER = 100;

export function AxesLayer({ app, x, y, scale, axisConstraint }) {
	const axesRef = useRef(null);

	useEffect(() => {
		if (!app) return;

		const axes = new Graphics();
		axes.label = "axes-layer";
		axes.zIndex = 20; // Layer 20
		app.stage.addChild(axes);
		axesRef.current = axes;

		return () => {
			axes.destroy();
			axesRef.current = null;
		};
	}, [app]);

	useEffect(() => {
		const axes = axesRef.current;
		if (!axes || !app) return;

		try {
			axes.clear();
		} catch (e) {
			return;
		}

		const screenW = app.renderer.screen.width;
		const screenH = app.renderer.screen.height;

		const worldLeft = (0 - x) / scale;
		const worldRight = (screenW - x) / scale;
		const worldTop = (0 - y) / scale;
		const worldBottom = (screenH - y) / scale;

		const buffer = BUFFER / scale;
		const minX = worldLeft - buffer;
		const maxX = worldRight + buffer;
		const minY = worldTop - buffer;
		const maxY = worldBottom + buffer;

		const alphaX = axisConstraint === "y" ? CONSTRAINED_ALPHA : FULL_ALPHA;
		const alphaY = axisConstraint === "x" ? CONSTRAINED_ALPHA : FULL_ALPHA;

		// Constant screen width for axes
		const strokeWidth = AXIS_WIDTH / scale;

		axes.moveTo(minX, 0).lineTo(maxX, 0);
		axes.stroke({ color: AXIS_COLOR_X, width: strokeWidth, alpha: alphaX });

		axes.moveTo(0, minY).lineTo(0, maxY);
		axes.stroke({ color: AXIS_COLOR_Y, width: strokeWidth, alpha: alphaY });

		// Origin circle also constant size?
		axes.circle(0, 0, ORIGIN_RADIUS / scale).fill({ color: ORIGIN_COLOR });
	}, [app, x, y, scale, axisConstraint]);

	return null;
}
