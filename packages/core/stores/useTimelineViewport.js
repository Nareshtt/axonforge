import { create } from "zustand";

const STORAGE_KEY = "axonforge:timeline-viewport";

// Load persisted viewport state
function loadViewportState() {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return {};
		const state = JSON.parse(stored);
		console.log("[timelineViewport] Loaded viewport from localStorage:", state);
		return state;
	} catch (err) {
		console.warn("[timelineViewport] Failed to load viewport:", err);
		return {};
	}
}

// Save viewport state to localStorage
function saveViewportState(state) {
	try {
		const toSave = {
			x: state.x,
			y: state.y,
			scale: state.scale,
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
	} catch (err) {
		console.warn("[timelineViewport] Failed to save viewport:", err);
	}
}

const persisted = loadViewportState();

export const useTimelineViewport = create((set, get) => ({
	x: persisted.x ?? 100,
	y: persisted.y ?? 0,
	scale: persisted.scale ?? 1,

	pan(dx, dy) {
		set((s) => {
			const newState = {
				x: s.x + dx,
				y: s.y + dy,
			};
			saveViewportState({ ...get(), ...newState });
			return newState;
		});
	},

	zoomAt(factor, cx, cy) {
		const { x, y, scale } = get();
		const newScale = Math.max(0.5, Math.min(2, scale * factor));

		const newState = {
			scale: newScale,
			x: cx - ((cx - x) * newScale) / scale,
			y: cy - ((cy - y) * newScale) / scale,
		};

		set(newState);
		saveViewportState({ ...get(), ...newState });
	},

	reset() {
		const newState = {
			x: 100,
			y: 0,
			scale: 1,
		};
		set(newState);
		saveViewportState(newState);
	},
}));
