import { create } from "zustand";
import { useViewport } from "../canvas/useViewport";

export const usePageStore = create((set, get) => ({
	pages: [],

	setPages: (pages) => {
		set({ pages });
		get().updateTransforms();
	},

	updateTransforms: () => {
		const { x: vx, y: vy, scale } = useViewport.getState();

		set((state) => ({
			pages: state.pages.map((p) => ({
				...p,
				render: {
					// Transform from logical workspace coordinates to screen coordinates
					// Apply viewport transform to the center position, then offset by half page size
					x: vx + p.cx * scale - (p.width * scale) / 2,
					y: vy + p.cy * scale - (p.height * scale) / 2,
					scale,
				},
			})),
		}));
	},
}));
