import { PAGE_PRESETS } from "./pageConfig";
import { usePageStore } from "../stores/pageStore";

export async function initPages() {
	const res = await fetch("/__pages");
	const registry = await res.json();

	const preset = PAGE_PRESETS.desktop;

	let cx = 0; // logical center position in workspace

	const pages = registry.map((p) => {
		const page = {
			...p,

			// page size (editor-owned)
			width: preset.width,
			height: preset.height,

			// logical workspace position (CENTER-based)
			cx,
			cy: 0,
		};

		cx += preset.width + 200; // stagger pages horizontally
		return page;
	});

	// 👇 IMPORTANT: this will also compute page.render
	usePageStore.getState().setPages(pages);
}
