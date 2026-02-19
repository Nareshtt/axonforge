import { create } from "zustand";
import { useViewport } from "./useViewport";
import {
	pushHistory,
	popHistory,
	savePagePositions,
	loadPagePositions,
	cleanupPagePositions,
} from "./localStorageState";
import { snapshot } from "./utils";

/* ---------- store ---------- */

export const usePageStore = create((set, get) => ({
	/* ---------------- State ---------------- */

	pages: [],

	/* ---------------- Init / Set ---------------- */

	setPages(pages) {
		const pageIds = pages.map(p => p.id);
		
		cleanupPagePositions(pageIds);
		
		const savedPositions = loadPagePositions(pageIds);

		const pagesWithPositions = pages.map((page) =>
			savedPositions[page.id] ? { ...page, ...savedPositions[page.id] } : page
		);

		set({ pages: pagesWithPositions });

		pushHistory(snapshot(pagesWithPositions));
		get().updateTransforms();
	},

	/* ---------------- Move ---------------- */

	movePageBy(pageId, dx, dy) {
		set((state) => ({
			pages: state.pages.map((page) =>
				page.id === pageId
					? { ...page, cx: page.cx + dx, cy: page.cy + dy }
					: page
			),
		}));

		get().updateTransforms();
		// Note: don't save on every move
	},

	setPagePosition(pageId, cx, cy) {
		set((state) => ({
			pages: state.pages.map((page) =>
				page.id === pageId ? { ...page, cx, cy } : page
			),
		}));

		get().updateTransforms();
		savePagePositions(get().pages);
	},

	commitMove() {
		const pages = get().pages;

		pushHistory(snapshot(pages));
		savePagePositions(pages);
	},

	/* ---------------- Undo ---------------- */

	undo() {
		const prev = popHistory();
		if (!prev) return;

		set((state) => ({
			pages: state.pages.map((page) =>
				prev[page.id] ? { ...page, ...prev[page.id] } : page
			),
		}));

		get().updateTransforms();
		savePagePositions(get().pages);
	},

	/* ---------------- Derived / Renderid ---------------- */

	updateTransforms() {
		const { x, y, scale } = useViewport.getState();

		set((state) => ({
			pages: state.pages.map((page) => ({
				...page,
				render: {
					x: x + page.cx * scale - (page.width * scale) / 2,
					y: y + page.cy * scale - (page.height * scale) / 2,
					scale,
				},
			})),
		}));
	},
}));
