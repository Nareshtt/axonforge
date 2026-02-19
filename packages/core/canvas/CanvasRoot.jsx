import { Stage, Layer, Rect } from "react-konva";
import { useEffect, useRef } from "react";
import Grid from "./Grid";
import { Axes } from "./Axes";
import { useViewport } from "../stores/useViewport";
import { useViewportSize } from "./useViewportSize";
import { useEditorStore } from "../stores/editorStore";
import { Commands } from "../editor/commands";
import { usePageStore } from "../stores/pageStore";
import { PageInstance } from "../page";

export function CanvasRoot() {
	const stageRef = useRef(null);
	const pages = usePageStore((s) => s.pages);

	const { width, height } = useViewportSize();
	const { x, y, scale, setCenter } = useViewport();

	const isPanning = useEditorStore((s) => s.isPanning);
	const clearSelection = useEditorStore((s) => s.clearSelection);
	const setFocusedSurface = useEditorStore((s) => s.setFocusedSurface);

	/* ---------------- Center origin ---------------- */
	useEffect(() => {
		setCenter(width, height);
	}, [width, height, setCenter]);

	/* ---------------- Zoom (always on) ---------------- */
	useEffect(() => {
		const stage = stageRef.current;
		if (!stage) return;

		const onWheel = (e) => {
			e.evt.preventDefault();
			const p = stage.getPointerPosition();
			if (!p) return;

			const factor = e.evt.deltaY > 0 ? 0.9 : 1.1;
			Commands.zoomAt(factor, p.x, p.y);
		};

		stage.on("wheel", onWheel);
		return () => stage.off("wheel", onWheel);
	}, []);

	/* ---------------- Cursor ---------------- */
	useEffect(() => {
		document.body.style.cursor = isPanning ? "grabbing" : "default";
		return () => {
			document.body.style.cursor = "default";
		};
	}, [isPanning]);

	/* ---------------- Focus canvas on mount and interaction ---------------- */
	useEffect(() => {
		// Set canvas as focused when component mounts
		setFocusedSurface("canvas");
	}, [setFocusedSurface]);

	// Calculate background rect dimensions in world coordinates
	const bgSize = 50000; // Large enough to cover viewport at any zoom
	const bgOffset = -bgSize / 2;

	return (
		<Stage
			ref={stageRef}
			width={width}
			height={height}
			x={x}
			y={y}
			scaleX={scale}
			scaleY={scale}
			onMouseDown={(e) => {
				// Set canvas as focused surface
				setFocusedSurface("canvas");

				// Clicked empty canvas → clear selection
				if (e.target === e.target.getStage()) {
					clearSelection();
				}
			}}
		>
			<Layer>
				{/* Dark theme background - positioned in world coordinates */}
				<Rect
					x={bgOffset}
					y={bgOffset}
					width={bgSize}
					height={bgSize}
					fill="#1a1d23"
					listening={false}
				/>

				<Grid />
				<Axes />

				{pages.map((page) => (
					<PageInstance key={page.id} page={page} />
				))}
			</Layer>
		</Stage>
	);
}
