import { create } from "zustand";
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
		const pageIds = pages.map((p) => p.id);

		cleanupPagePositions(pageIds);

		const savedPositions = loadPagePositions(pageIds);

		const pagesWithPositions = pages.map((page) =>
			savedPositions[page.id] ? { ...page, ...savedPositions[page.id] } : page
		);

		set({ pages: pagesWithPositions });

		pushHistory(snapshot(pagesWithPositions));
	},

	/* ---------------- Move ---------------- */

	movePageBy(pageId, dx, dy) {
		set((state) => ({
			pages: state.pages.map((page) =>
				page.id === pageId ?
					{ ...page, cx: page.cx + dx, cy: page.cy + dy }
				:	page
			),
		}));
	},

	setPagePosition(pageId, cx, cy) {
		set((state) => ({
			pages: state.pages.map((page) =>
				page.id === pageId ? { ...page, cx, cy } : page
			),
		}));

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

		savePagePositions(get().pages);
	},

	/* ---------------- Derived / Renderid ---------------- */

	/* ---------------- Derived / Rendered ---------------- */

	/* No-op: PageDOM now computes its transform inline from useViewport. */
	updateTransforms() {},
}));
