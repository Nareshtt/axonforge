import { create } from "zustand";

const STORAGE_KEY = "axonforge:editor-state";

// Load persisted state
function loadEditorState() {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return {};
		const state = JSON.parse(stored);
		console.log("[editorStore] Loaded state from localStorage:", state);
		return state;
	} catch (err) {
		console.warn("[editorStore] Failed to load state:", err);
		return {};
	}
}

// Save state to localStorage
function saveEditorState(state) {
	try {
		const toSave = {
			timelineOpen: state.timelineOpen,
			focusedSurface: state.focusedSurface,
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
		console.log("[editorStore] Saved state to localStorage");
	} catch (err) {
		console.warn("[editorStore] Failed to save state:", err);
	}
}

const persisted = loadEditorState();

export const useEditorStore = create((set, get) => ({
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

	// --- TIMELINE (PERSISTED) ---
	timelineOpen: persisted.timelineOpen ?? false,
	toggleTimeline: () => {
		set((s) => {
			const newState = { timelineOpen: !s.timelineOpen };
			saveEditorState({ ...get(), ...newState });
			return newState;
		});
	},

	// --- FOCUSED SURFACE (PERSISTED) ---
	focusedSurface: persisted.focusedSurface ?? "canvas",
	setFocusedSurface: (v) => {
		set({ focusedSurface: v });
		saveEditorState(get());
	},
}));
