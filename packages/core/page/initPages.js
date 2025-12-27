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

	// 🔥 LIVE FILESYSTEM UPDATES
	if (import.meta.hot) {
		import.meta.hot.on("pages:update", (fsPages) => {
			console.log("[client] received pages:update", fsPages);

			usePageStore.setState((state) => {
				const byId = Object.fromEntries(state.pages.map((p) => [p.id, p]));
				const byName = Object.fromEntries(state.pages.map((p) => [p.name, p]));

				const merged = fsPages.map((fsPage) => {
					// Try to find existing page by ID (if folder name unchanged)
					let existing = byId[fsPage.id];

					// If not found by ID, try to find by name (if folder was renamed)
					if (!existing) {
						existing = byName[fsPage.id]; // fsPage.id is the new folder name
					}

					return {
						...fsPage,
						// Preserve display name if we had it, otherwise use folder name
						name: existing?.name ?? fsPage.id,
						width: existing?.width ?? preset.width,
						height: existing?.height ?? preset.height,
						cx: existing?.cx ?? 0,
						cy: existing?.cy ?? 0,
					};
				});

				return { pages: merged };
			});

			// Recompute transforms
			usePageStore.getState().updateTransforms();
		});
	}
}
