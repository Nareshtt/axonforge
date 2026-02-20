import { create } from "zustand";
import { loadViewport, saveViewport } from "./localStorageState";

const DEFAULT_SCALE = 0.4;

const persisted = loadViewport();

export const useViewport = create((set, get) => ({
	x: persisted?.x ?? 0,
	y: persisted?.y ?? 0,
	scale: persisted?.scale ?? DEFAULT_SCALE,

	setViewport(x, y, scale) {
		set({ x, y, scale });
		saveViewport(get());
	},

	setCenter(width, height) {
		const { x, y } = get();
		if (x !== 0 || y !== 0) return;

		set({
			x: width / 2,
			y: height / 2,
		});

		saveViewport(get());
	},

	pan(dx, dy) {
		set((state) => ({
			x: state.x + dx,
			y: state.y + dy,
		}));

		saveViewport(get());
	},

	zoomAt(factor, cx, cy) {
		const { x, y, scale } = get();
		const MIN_SCALE = 0.05;
		const MAX_SCALE = 5.0;

		let newScale = scale * factor;

		// Clamp scale
		if (newScale < MIN_SCALE) newScale = MIN_SCALE;
		if (newScale > MAX_SCALE) newScale = MAX_SCALE;

		// If scale didn't change (hit limit), don't update position
		if (newScale === scale) return;

		set({
			scale: newScale,
			x: cx - ((cx - x) * newScale) / scale,
			y: cy - ((cy - y) * newScale) / scale,
		});

		saveViewport(get());
	},

	zoomTo(targetScale, cx, cy) {
		const { x, y, scale } = get();
		const MIN_SCALE = 0.05;
		const MAX_SCALE = 5.0;

		let newScale = targetScale;

		// Clamp scale
		if (newScale < MIN_SCALE) newScale = MIN_SCALE;
		if (newScale > MAX_SCALE) newScale = MAX_SCALE;

		// If scale didn't change (hit limit), don't update position
		if (Math.abs(newScale - scale) < 0.0001) return;

		set({
			scale: newScale,
			x: cx - ((cx - x) * newScale) / scale,
			y: cy - ((cy - y) * newScale) / scale,
		});

		saveViewport(get());
	},

	focusOnPage(page, screenWidth, screenHeight) {
		const pageCenterX = page.cx ?? 0;
		const pageCenterY = page.cy ?? 0;
		const targetScale = DEFAULT_SCALE;

		// Center the viewport on the page center
		// viewport x,y is where the origin (0,0) of world space is on screen
		// To center page center on screen: screenCenter = viewport + pageCenter * scale
		// screenCenter = (screenWidth/2, screenHeight/2)
		// x = screenWidth/2 - pageCenterX * scale
		// y = screenHeight/2 - pageCenterY * scale

		const newX = screenWidth / 2 - pageCenterX * targetScale;
		const newY = screenHeight / 2 - pageCenterY * targetScale;

		set({
			x: newX,
			y: newY,
			scale: targetScale,
		});

		saveViewport(get());
	},
}));
