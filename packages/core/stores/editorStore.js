import { create } from "zustand";
import { loadEditorState, saveEditorState } from "./localStorageState";

const persisted = loadEditorState();

export const useEditorStore = create((set, get) => ({
	// --- MODE ---
	mode: "view", // "view"/"edit"

	toggleMode() {
		set((state) => ({
			mode: state.mode === "view" ? "edit" : "view",
		}));
	},

	// --- SELECTION ---
	selectedPageId: null, // id like 1,2,3,4.../null
	selectedElementPath: null, // array of indices from page container to element
	hoveredElementPath: null,

	selectPage(id) {
		set({ selectedPageId: id, selectedElementPath: null, hoveredElementPath: null });
	},

	selectElementPath(path) {
		set({ selectedElementPath: path });
	},

	setHoveredElementPath(path) {
		set({ hoveredElementPath: path });
	},

	// --- UI LAYOUT ---
	leftSidebarWidth: 48,
	setLeftSidebarWidth(width) {
		set({ leftSidebarWidth: width });
	},

	clearSelection() {
		set({ selectedPageId: null, selectedElementPath: null, hoveredElementPath: null });
	},

	clearElementSelection() {
		set({ selectedElementPath: null, hoveredElementPath: null });
	},

	// --- PAN ---
	isPanning: false, // true/false

	setIsPanning(bool) {
		set({ isPanning: bool });
	},

	// --- TIMELINE PAN ---
	isTimelinePanning: false, // true/false

	setIsTimelinePanning(bool) {
		set({ isTimelinePanning: bool });
	},

	// --- AXIS CONSTRAINT ---
	axisConstraint: null, // null | 'x' | 'y'

	setAxisConstraint(axis) {
		set({ axisConstraint: axis });
	},

	// --- MOVE ---
	isMoving: false,

	setIsMoving(bool) {
		set({
			isMoving: bool,
			// Reset axis constraint when exiting move mode
			axisConstraint: null,
		});
	},

	// --- TIMELINE (PERSISTED) ---
	timelineOpen: persisted.timelineOpen ?? false, // true/false if null from local storage defaults to false

	toggleTimeline() {
		set((state) => ({
			timelineOpen: !state.timelineOpen,
		}));

		saveEditorState(get());
	},

	// --- FOCUSED SURFACE (PERSISTED) ---
	focusedSurface: persisted.focusedSurface ?? "canvas", // "canvas"/"timeline"/"sidebar" from local storage if null then canvas

	setFocusedSurface(surface) {
		set({ focusedSurface: surface });
		saveEditorState(get());
	},
	
	focusOnSidebar() {
		set({ focusedSurface: "sidebar" });
		saveEditorState(get());
	},
	
	focusOnCanvas() {
		set({ focusedSurface: "canvas" });
		saveEditorState(get());
	},
}));
