import { useEffect, useRef } from "react";
import { useViewport } from "../../stores/useViewport";
import { useEditorStore } from "../../stores/editorStore";

const ZOOM_OUT_FACTOR = 0.9;
const ZOOM_IN_FACTOR = 1.1;
const LERP_FACTOR = 0.2;

export function useWheelZoom(app) {
	const zoomTarget = useRef({
		scale: useViewport.getState().scale,
		x: 0,
		y: 0,
		active: false,
	});
	const zoomTo = useViewport((s) => s.zoomTo);

	useEffect(() => {
		if (!app) return;

		const onWheel = (e) => {
			// Auto-detect surface from pointer target
			const t = e?.target;
			const el = t instanceof Element ? t : (t && t.parentElement instanceof Element ? t.parentElement : null);
			if (
				el &&
				(
					el.closest("[data-timeline]") ||
					el.closest("[data-left-sidebar]") ||
					el.closest("[data-sidebar]") ||
					el.closest("[data-topbar]")
				)
			) {
				return; // Allow normal scroll in UI panels
			}

			// Ensure canvas is focused when zooming
			const st = useEditorStore.getState();
			if (st.focusedSurface !== "canvas") st.setFocusedSurface("canvas");

			e.preventDefault();
			const { scale } = useViewport.getState();

			// If we were idle, sync target to current
			if (!zoomTarget.current.active) {
				zoomTarget.current.scale = scale;
				zoomTarget.current.active = true;
			}

			const rect = app.canvas.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			// Update target
			const factor = e.deltaY > 0 ? ZOOM_OUT_FACTOR : ZOOM_IN_FACTOR;
			zoomTarget.current.scale *= factor;
			zoomTarget.current.x = mouseX;
			zoomTarget.current.y = mouseY;
		};

		const onTick = () => {
			const { scale } = useViewport.getState();

			// Check if we are actively wheel-zooming
			if (!zoomTarget.current.active) {
				// Not active? Just sync target to current scale so we're ready for next time
				zoomTarget.current.scale = scale;
				return;
			}

			const { scale: targetScale, x: mx, y: my } = zoomTarget.current;

			// If close enough, stop
			if (Math.abs(targetScale - scale) < 0.001) {
				zoomTarget.current.active = false;
				zoomTarget.current.scale = scale; // Sync
				return;
			}

			// Lerp
			zoomTarget.current.active = true;
			const newScale = scale + (targetScale - scale) * LERP_FACTOR;
			zoomTo(newScale, mx, my);
		};

		window.addEventListener("wheel", onWheel, { passive: false });
		app.ticker.add(onTick);

		return () => {
			window.removeEventListener("wheel", onWheel);
			if (app && app.ticker) {
				app.ticker.remove(onTick);
			}
		};
	}, [app, zoomTo]);
}
