// In editorStore.js - add axis constraint state
import { create } from "zustand";

export const useEditorStore = create((set) => ({
	// --- MODE ---
	mode: "view",

	toggleMode: () =>
		set((s) => ({
			mode: s.mode === "view" ? "edit" : "view",
		})),

	// --- SELECTION ---
	selectedPageId: null,

	selectPage: (id) => set({ selectedPageId: id }),
	clearSelection: () => set({ selectedPageId: null }),

	// --- PAN ---
	isPanning: false,
	setIsPanning: (v) => set({ isPanning: v }),

	// --- MOVE ---
	isMoving: false,
	setIsMoving: (v) =>
		set({
			isMoving: v,
			// Reset axis constraint when exiting move mode
			axisConstraint: v ? null : null,
		}),

	// --- AXIS CONSTRAINT ---
	axisConstraint: null, // null | 'x' | 'y'
	setAxisConstraint: (axis) => set({ axisConstraint: axis }),
}));
