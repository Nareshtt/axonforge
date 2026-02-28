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

		const pagesWithPositions = pages.map((page) => {
			const saved = savedPositions[page.id];
			
			return {
				...page,
				...(saved ? { cx: saved.cx, cy: saved.cy } : {}),
				// selectedClasses will be loaded from code file, not localStorage
			};
		});

		set({ pages: pagesWithPositions });

		pushHistory(snapshot(pagesWithPositions));
	},

	/* ---------------- Update Page Properties ---------------- */

	updatePageProperties(pageId, properties) {
		set((state) => ({
			pages: state.pages.map((page) =>
				page.id === pageId
					? { ...page, ...properties }
					: page
			),
		}));
		// Note: selectedClasses come from code file, not stored here
	},

	/* ---------------- Element Management ---------------- */

	addElement(pageId, element) {
		set((state) => ({
			pages: state.pages.map((page) =>
				page.id === pageId
					? { 
						...page, 
						elements: [...(page.elements || []), { 
							id: Date.now().toString(),
							...element 
						}] 
					}
					: page
			),
		}));
	},

	updateElement(pageId, elementId, properties) {
		set((state) => ({
			pages: state.pages.map((page) =>
				page.id === pageId
					? {
						...page,
						elements: (page.elements || []).map((el) =>
							el.id === elementId
								? { ...el, ...properties }
								: el
						),
					}
					: page
			),
		}));
	},

	updateElementStyles(pageId, elementId, styles) {
		set((state) => ({
			pages: state.pages.map((page) =>
				page.id === pageId
					? {
						...page,
						elements: (page.elements || []).map((el) =>
							el.id === elementId
								? { ...el, styles: { ...el.styles, ...styles } }
								: el
						),
					}
					: page
			),
		}));
		// Note: element styles come from code file, not stored here
	},

	deleteElement(pageId, elementId) {
		set((state) => ({
			pages: state.pages.map((page) =>
				page.id === pageId
					? {
						...page,
						elements: (page.elements || []).filter((el) => el.id !== elementId),
					}
					: page
			),
		}));
	},

	getElement(pageId, elementId) {
		const page = get().pages.find((p) => p.id === pageId);
		if (!page) return null;
		return (page.elements || []).find((el) => el.id === elementId);
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
