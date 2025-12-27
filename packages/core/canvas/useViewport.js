import { create } from "zustand";
import { usePageStore } from "../stores/pageStore";

export const useViewport = create((set, get) => ({
	x: 0,
	y: 0,
	scale: 0.3,

	setCenter: (width, height) => {
		set({
			x: width / 2,
			y: height / 2,
		});

		// 👇 THIS WAS MISSING
		usePageStore.getState().updateTransforms();
	},

	pan: (dx, dy) => {
		set((s) => ({
			x: s.x + dx,
			y: s.y + dy,
		}));

		usePageStore.getState().updateTransforms();
	},

	zoomAt: (factor, cx, cy) => {
		const { x, y, scale } = get();
		const newScale = scale * factor;

		set({
			scale: newScale,
			x: cx - ((cx - x) * newScale) / scale,
			y: cy - ((cy - y) * newScale) / scale,
		});

		usePageStore.getState().updateTransforms();
	},
}));
