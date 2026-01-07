import { create } from "zustand";
import { usePageStore } from "./pageStore";
import { loadViewport, saveViewport } from "./localStorageState";

const persisted = loadViewport();

export const useViewport = create((set, get) => ({
	/* ---------------- State ---------------- */

	x: persisted?.x ?? 0,
	y: persisted?.y ?? 0,
	scale: persisted?.scale ?? 0.3,

	/* ---------------- Center ---------------- */

	setCenter(width, height) {
		// ⚠️ Do NOT overwrite persisted viewport if user already moved
		const { x, y } = get();
		if (x !== 0 || y !== 0) return;

		set({
			x: width / 2,
			y: height / 2,
		});

		// Persist full snapshot
		saveViewport(get());

		// Update derived page transforms
		usePageStore.getState().updateTransforms();
	},

	/* ---------------- Pan ---------------- */
	pan(dx, dy) {
		set((state) => ({
			x: state.x + dx,
			y: state.y + dy,
		}));

		saveViewport(get());
		usePageStore.getState().updateTransforms();
	},

	/* ---------------- Zoom ---------------- */

	zoomAt(factor, cx, cy) {
		const { x, y, scale } = get();
		const newScale = scale * factor;

		set({
			scale: newScale,
			x: cx - ((cx - x) * newScale) / scale,
			y: cy - ((cy - y) * newScale) / scale,
		});

		// Persist full snapshot (already updated)
		saveViewport(get());

		usePageStore.getState().updateTransforms();
	},
}));
