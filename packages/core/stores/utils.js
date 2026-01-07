export const snapshot = (pages) => {
	const out = {};
	for (const page of pages) {
		out[page.id] = { cx: page.cx, cy: page.cy };
	}
	return out;
};
