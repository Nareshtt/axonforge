import { create } from "zustand";

export const useEditorStore = create((set) => ({
	mode: "edit",
	isPanning: false,

	toggleMode: () =>
		set((s) => ({
			mode: s.mode === "edit" ? "view" : "edit",
		})),

	setIsPanning: (v) => set({ isPanning: v }),
}));
