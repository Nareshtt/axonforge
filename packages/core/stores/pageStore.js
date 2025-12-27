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

/* ---------- store ---------- */

export const usePageStore = create((set, get) => ({
	pages: [],

	setPages: (pages) => {
		set({ pages });
		pushHistory(snapshot(pages));
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
	},

	// 🔥 CALL THIS WHEN MOVE ENDS (mouse up)
	commitMove: () => {
		const pages = get().pages;
		pushHistory(snapshot(pages));
	},

	/* ---------- UNDO ---------- */

	undo: () => {
		const prev = popHistory();
		if (!prev) return;

		set((state) => ({
			pages: state.pages.map((p) => (prev[p.id] ? { ...p, ...prev[p.id] } : p)),
		}));

		get().updateTransforms();
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
