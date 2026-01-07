import { create } from "zustand";
import {
	loadTimelineViewportState,
	saveTimelineViewportState,
} from "./localStorageState";

const persisted = loadTimelineViewportState();

export const useTimelineViewport = create((set, get) => ({
	/* ---------------- State ---------------- */

	x: persisted.x ?? 100,
	y: persisted.y ?? 50,
	scale: persisted.scale ?? 1,

	/* ---------------- Pan ---------------- */

	pan(dx, dy) {
		set((state) => ({
			x: state.x + dx,
			y: state.y + dy,
		}));

		// Persist full snapshot (already updated)
		saveTimelineViewportState(get());
	},

	/* ---------------- Zoom ---------------- */

	zoomAt(factor, cx, cy) {
		const { x, y, scale } = get();
		const newScale = Math.max(0.5, Math.min(1.5, scale * factor));

		set({
			scale: newScale,
			x: cx - ((cx - x) * newScale) / scale,
			y: cy - ((cy - y) * newScale) / scale,
		});

		// Persist full snapshot (already updated)
		saveTimelineViewportState(get());
	},

	/* ---------------- Reset ---------------- */

	reset() {
		set({
			x: 100,
			y: 50,
			scale: 1,
		});

		// Persist full snapshot
		saveTimelineViewportState(get());
	},
}));
