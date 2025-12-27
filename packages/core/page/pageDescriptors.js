import { PAGE_PRESETS } from "./pageConfig";

export function createPageDescriptors(pages) {
	const preset = PAGE_PRESETS.desktop;

	const spacing = 200;
	let cursorX = 0;

	return pages.map((page) => {
		const descriptor = {
			...page,
			width: preset.width,
			height: preset.height,

			// editor-only workspace position
			x: cursorX,
			y: 0,
		};

		cursorX += preset.width + spacing;
		return descriptor;
	});
}
