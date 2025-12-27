import { create } from "zustand";
import { usePageStore } from "../stores/pageStore";

/* ---------------- Persistence ---------------- */

const STORAGE_KEY = "axonforge:viewport";

function loadViewport() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function saveViewport(state) {
	const { x, y, scale } = state;
	localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y, scale }));
}

/* ---------------- Store ---------------- */

export const useViewport = create((set, get) => {
	// 🔥 Restore persisted state if available
	const persisted = loadViewport();

	const initial = {
		x: persisted?.x ?? 0,
		y: persisted?.y ?? 0,
		scale: persisted?.scale ?? 0.3,
	};

	return {
		...initial,

		/* ---------------- Center ---------------- */

		setCenter: (width, height) => {
			// ⚠️ Do NOT overwrite persisted viewport if user already moved
			const { x, y } = get();
			if (x !== 0 || y !== 0) return;

			set({
				x: width / 2,
				y: height / 2,
			});

			saveViewport(get());
			usePageStore.getState().updateTransforms();
		},

		/* ---------------- Pan ---------------- */

		pan: (dx, dy) => {
			set((s) => {
				const next = {
					x: s.x + dx,
					y: s.y + dy,
				};
				saveViewport({ ...s, ...next });
				return next;
			});

			usePageStore.getState().updateTransforms();
		},

		/* ---------------- Zoom ---------------- */

		zoomAt: (factor, cx, cy) => {
			const { x, y, scale } = get();
			const newScale = scale * factor;

			const next = {
				scale: newScale,
				x: cx - ((cx - x) * newScale) / scale,
				y: cy - ((cy - y) * newScale) / scale,
			};

			set(next);
			saveViewport({ ...get(), ...next });
			usePageStore.getState().updateTransforms();
		},
	};
});
