import { Stage, Layer } from "react-konva";
import { useEffect, useRef } from "react";
import Grid from "./Grid";
import { Axes } from "./Axes";
import { useViewport } from "./useViewport";
import { useViewportSize } from "./useViewportSize";
import { useEditorStore } from "../stores/editorStore";
import { Commands } from "../editor/commands";
import { usePageStore } from "../stores/pageStore";
import { PageInstance } from "../page/pageInstance";

export function CanvasRoot() {
	const stageRef = useRef(null);
	const pages = usePageStore((s) => s.pages);

	const { width, height } = useViewportSize();
	const { x, y, scale, setCenter } = useViewport();
	const isPanning = useEditorStore((s) => s.isPanning);

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
		return () => (document.body.style.cursor = "default");
	}, [isPanning]);

	return (
		<Stage
			ref={stageRef}
			width={width}
			height={height}
			x={x}
			y={y}
			scaleX={scale}
			scaleY={scale}
		>
			<Layer>
				<Grid />
				<Axes />

				{pages.map((page) => (
					<PageInstance key={page.id} page={page} />
				))}
			</Layer>
		</Stage>
	);
}
