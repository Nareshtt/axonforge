import { create } from "zustand";
import { useViewport } from "../canvas/useViewport";

export const usePageStore = create((set, get) => ({
	pages: [],

	setPages: (pages) => {
		set({ pages });
		get().updateTransforms();
	},

	// ✅ RENAME (single source of truth)
	renamePage: (pageId, name) => {
		set((state) => ({
			pages: state.pages.map((p) => (p.id === pageId ? { ...p, name } : p)),
		}));
	},

	movePageBy: (pageId, dx, dy) => {
		set((state) => ({
			pages: state.pages.map((p) =>
				p.id === pageId ? { ...p, cx: p.cx + dx, cy: p.cy + dy } : p
			),
		}));
		get().updateTransforms();
	},

	setPagePosition: (pageId, cx, cy) => {
		set((state) => ({
			pages: state.pages.map((p) => (p.id === pageId ? { ...p, cx, cy } : p)),
		}));
		get().updateTransforms();
	},

	updateTransforms: () => {
		const { x: vx, y: vy, scale } = useViewport.getState();

		set((state) => ({
			pages: state.pages.map((p) => ({
				...p,
				render: {
					x: vx + p.cx * scale - (p.width * scale) / 2,
					y: vy + p.cy * scale - (p.height * scale) / 2,
					scale,
				},
			})),
		}));
	},
}));
