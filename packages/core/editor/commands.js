import { useViewport } from "../canvas/useViewport";
import { useEditorStore } from "../stores/editorStore";

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
};
