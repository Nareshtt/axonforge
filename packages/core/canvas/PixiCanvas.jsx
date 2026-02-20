import { useRef, useEffect } from "react";
import { useViewport } from "../stores/useViewport";
import { useEditorStore } from "../stores/editorStore";
import { usePageStore } from "../stores/pageStore";

import { usePixiApp } from "./hooks/usePixiApp";
import { useViewportSync } from "./hooks/useViewportSync";
import { useWheelZoom } from "./hooks/useWheelZoom";
import { useCursorManager } from "./hooks/useCursorManager";

import { BackgroundLayer } from "./components/BackgroundLayer";
import { GridLayer } from "./components/GridLayer";
import { AxesLayer } from "./components/AxesLayer";
import { PageLayer } from "./components/PageLayer";
import { ZoomIndicator } from "./components/ZoomIndicator";

const CANVAS_STYLE = {
	position: "fixed",
	top: 0,
	left: 0,
	width: "100%",
	height: "100%",
	overflow: "hidden",
	zIndex: 0,
	background: "radial-gradient(circle at center, #0a0a0a 0%, #000000 100%)",
};

export function PixiCanvas() {
	const containerRef = useRef(null);

	const x = useViewport((s) => s.x);
	const y = useViewport((s) => s.y);
	const scale = useViewport((s) => s.scale);
	const setCenter = useViewport((s) => s.setCenter);

	const pages = usePageStore((s) => s.pages);
	const selectedPageId = useEditorStore((s) => s.selectedPageId);
	const selectPage = useEditorStore((s) => s.selectPage);
	const isPanning = useEditorStore((s) => s.isPanning);
	const clearSelection = useEditorStore((s) => s.clearSelection);
	const setFocusedSurface = useEditorStore((s) => s.setFocusedSurface);
	const mode = useEditorStore((s) => s.mode);
	const axisConstraint = useEditorStore((s) => s.axisConstraint);

	const app = usePixiApp(containerRef);

	useViewportSync(app, x, y, scale);
	useWheelZoom(app);
	useCursorManager(isPanning);

	useEffect(() => {
		setCenter(window.innerWidth, window.innerHeight);
	}, [setCenter]);

	return (
		<>
			<div ref={containerRef} style={CANVAS_STYLE} />
			{app && (
				<>
					<BackgroundLayer
						app={app}
						onClearSelection={clearSelection}
						onSetFocusedSurface={setFocusedSurface}
					/>
					<GridLayer app={app} />
					<AxesLayer
						app={app}
						x={x}
						y={y}
						scale={scale}
						axisConstraint={axisConstraint}
					/>
					<PageLayer
						app={app}
						pages={pages}
						selectedPageId={selectedPageId}
						mode={mode}
						onSelectPage={selectPage}
					/>
					<ZoomIndicator />
				</>
			)}
		</>
	);
}

export default PixiCanvas;
