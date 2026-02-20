import { create } from "zustand";
import {
	loadTimelineViewportState,
	saveTimelineViewportState,
} from "./localStorageState";

const persisted = loadTimelineViewportState();

const MIN_SCALE = 0.1;
const MAX_SCALE = 2.0;
const ZOOM_OUT_FACTOR = 0.9;
const ZOOM_IN_FACTOR = 1.1;
const LERP_FACTOR = 0.15;

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

		saveTimelineViewportState(get());
	},

	/* ---------------- Zoom ---------------- */

	zoomAt(factor, cx, cy) {
		const { x, y, scale } = get();

		let newScale = scale * factor;

		if (newScale < MIN_SCALE) newScale = MIN_SCALE;
		if (newScale > MAX_SCALE) newScale = MAX_SCALE;

		set({
			scale: newScale,
			x: cx - ((cx - x) * newScale) / scale,
			y: cy - ((cy - y) * newScale) / scale,
		});

		saveTimelineViewportState(get());
	},

	zoomTo(targetScale, cx, cy) {
		const { x, y, scale } = get();

		let newScale = targetScale;

		if (newScale < MIN_SCALE) newScale = MIN_SCALE;
		if (newScale > MAX_SCALE) newScale = MAX_SCALE;

		if (Math.abs(newScale - scale) < 0.0001) return;

		set({
			scale: newScale,
			x: cx - ((cx - x) * newScale) / scale,
			y: cy - ((cy - y) * newScale) / scale,
		});

		saveTimelineViewportState(get());
	},

	/* ---------------- Reset ---------------- */

	reset() {
		set({
			x: 100,
			y: 50,
			scale: 1,
		});

		saveTimelineViewportState(get());
	},
}));
