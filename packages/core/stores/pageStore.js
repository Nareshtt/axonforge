import { create } from "zustand";
import { useViewport } from "../canvas/useViewport";
import { pushHistory, popHistory } from "../editor/pageHistory";

/* ---------- helpers ---------- */

function snapshot(pages) {
	const out = {};
	for (const p of pages) {
		out[p.id] = { cx: p.cx, cy: p.cy };
	}
	return out;
}

// 🔑 PERSISTENCE HELPERS
const STORAGE_KEY = "axonforge:page-positions";

function savePositions(pages) {
	try {
		const positions = {};
		for (const p of pages) {
			positions[p.id] = { cx: p.cx, cy: p.cy };
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
		console.log("[pageStore] Saved positions to localStorage");
	} catch (err) {
		console.warn("[pageStore] Failed to save positions:", err);
	}
}

function loadPositions() {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return {};
		const positions = JSON.parse(stored);
		console.log("[pageStore] Loaded positions from localStorage:", positions);
		return positions;
	} catch (err) {
		console.warn("[pageStore] Failed to load positions:", err);
		return {};
	}
}

/* ---------- store ---------- */

export const usePageStore = create((set, get) => ({
	pages: [],

	setPages: (pages) => {
		// 🔑 Restore saved positions
		const savedPositions = loadPositions();

		const pagesWithPositions = pages.map((p) => {
			if (savedPositions[p.id]) {
				return { ...p, ...savedPositions[p.id] };
			}
			return p;
		});

		set({ pages: pagesWithPositions });
		pushHistory(snapshot(pagesWithPositions));
		get().updateTransforms();
	},

	movePageBy: (pageId, dx, dy) => {
		set((state) => {
			const pages = state.pages.map((p) =>
				p.id === pageId ? { ...p, cx: p.cx + dx, cy: p.cy + dy } : p
			);
			return { pages };
		});

		get().updateTransforms();
		// Note: Don't save on every move - only on commitMove
	},

	setPagePosition: (pageId, cx, cy) => {
		set((state) => ({
			pages: state.pages.map((p) => (p.id === pageId ? { ...p, cx, cy } : p)),
		}));
		get().updateTransforms();

		// 🔑 Save immediately for snap operations
		savePositions(get().pages);
	},

	// 🔥 CALL THIS WHEN MOVE ENDS (mouse up)
	commitMove: () => {
		const pages = get().pages;
		pushHistory(snapshot(pages));

		// 🔑 Save to localStorage
		savePositions(pages);
	},

	/* ---------- UNDO ---------- */

	undo: () => {
		const prev = popHistory();
		if (!prev) return;

		set((state) => ({
			pages: state.pages.map((p) => (prev[p.id] ? { ...p, ...prev[p.id] } : p)),
		}));

		get().updateTransforms();

		// 🔑 Save after undo
		savePositions(get().pages);
	},

	/* ---------- render ---------- */

	updateTransforms: () => {
		const { x, y, scale } = useViewport.getState();

		set((state) => ({
			pages: state.pages.map((p) => ({
				...p,
				render: {
					x: x + p.cx * scale - (p.width * scale) / 2,
					y: y + p.cy * scale - (p.height * scale) / 2,
					scale,
				},
			})),
		}));
	},
}));
