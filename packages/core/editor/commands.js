// In commands.js - add the new command
import { useViewport } from "../stores/useViewport";
import { useEditorStore } from "../stores/editorStore";
import { usePageStore } from "../stores/pageStore";

export const Commands = {
	// --- NAVIGATION ---
	panStart() {
		useEditorStore.getState().setIsPanning(true);
	},

	panEnd() {
		useEditorStore.getState().setIsPanning(false);
	},

	panBy(dx, dy) {
		useViewport.getState().pan(dx, dy);
	},

	zoomAt(factor, x, y) {
		useViewport.getState().zoomAt(factor, x, y);
	},

	// --- MODE ---
	toggleMode() {
		useEditorStore.getState().toggleMode();
	},

	// --- PAGE OPERATIONS ---
	snapPageToOrigin(pageId) {
		// Snap the page's center to the workspace origin (0, 0)
		usePageStore.getState().setPagePosition(pageId, 0, 0);

		// Commit to history
		usePageStore.getState().commitMove();
	},

	movePageBy(pageId, dx, dy) {
		// Move page by delta in logical coordinates
		usePageStore.getState().movePageBy(pageId, dx, dy);
	},
};
