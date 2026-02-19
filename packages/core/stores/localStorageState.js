/* =========================================================
   Generic storage helpers
   ========================================================= */

function loadFromStorage(key, fallback) {
	try {
		const stored = localStorage.getItem(key);
		return stored ? JSON.parse(stored) : fallback;
	} catch {
		return fallback;
	}
}

function saveToStorage(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}

/* =========================================================
   Storage keys
   ========================================================= */

const STORAGE_KEY = {
	// Editor UI state
	editor: "axonforge:editor-state",

	// Timeline viewport (timeline canvas)
	timelineViewport: "axonforge:timeline-viewport",

	// Main viewport (canvas / pages)
	viewport: "axonforge:viewport",

	// Page history (undo stack)
	history: "axonforge:page-history",

	// Page logical positions (cx, cy)
	pagePositions: "axonforge:page-positions",
};

const MAX_HISTORY = 15;

/* =========================================================
   Editor state persistence
   ========================================================= */

export const loadEditorState = () => loadFromStorage(STORAGE_KEY.editor, {});

export const saveEditorState = (state) =>
	saveToStorage(STORAGE_KEY.editor, {
		timelineOpen: state.timelineOpen,
		focusedSurface: state.focusedSurface,
	});

/* =========================================================
   Timeline viewport persistence
   ========================================================= */

export const loadTimelineViewportState = () =>
	loadFromStorage(STORAGE_KEY.timelineViewport, {});

export const saveTimelineViewportState = (state) =>
	saveToStorage(STORAGE_KEY.timelineViewport, {
		x: state.x,
		y: state.y,
		scale: state.scale,
	});

/* =========================================================
   Main viewport persistence
   ========================================================= */

export function loadViewport() {
	return loadFromStorage(STORAGE_KEY.viewport, null);
}

export function saveViewport(state) {
	const { x, y, scale } = state;
	saveToStorage(STORAGE_KEY.viewport, { x, y, scale });
}

/* =========================================================
   Page positions persistence (cx, cy)
   ========================================================= */

export function loadPagePositions(validPageIds = null) {
	const allPositions = loadFromStorage(STORAGE_KEY.pagePositions, {});
	
	if (!validPageIds) {
		return allPositions;
	}
	
	const validIds = new Set(validPageIds);
	const filtered = {};
	for (const [id, pos] of Object.entries(allPositions)) {
		if (validIds.has(id)) {
			filtered[id] = pos;
		}
	}
	return filtered;
}

export function savePagePositions(pages) {
	try {
		const positions = {};
		for (const p of pages) {
			positions[p.id] = { cx: p.cx, cy: p.cy };
		}
		saveToStorage(STORAGE_KEY.pagePositions, positions);
	} catch {}
}

export function cleanupPagePositions(validPageIds) {
	const allPositions = loadFromStorage(STORAGE_KEY.pagePositions, {});
	const validIds = new Set(validPageIds);
	let hasChanges = false;
	const cleaned = {};
	
	for (const [id, pos] of Object.entries(allPositions)) {
		if (validIds.has(id)) {
			cleaned[id] = pos;
		} else {
			hasChanges = true;
		}
	}
	
	if (hasChanges) {
		saveToStorage(STORAGE_KEY.pagePositions, cleaned);
	}
}

/* =========================================================
   Page history (undo stack)
   ========================================================= */

export function loadHistory() {
	return loadFromStorage(STORAGE_KEY.history, []);
}

export function pushHistory(layout) {
	const history = loadHistory();

	// IMPORTANT: snapshot clone to avoid reference bugs
	history.push(
		typeof structuredClone === "function"
			? structuredClone(layout)
			: JSON.parse(JSON.stringify(layout))
	);

	if (history.length > MAX_HISTORY) {
		history.shift(); // drop oldest snapshot
	}

	saveToStorage(STORAGE_KEY.history, history);
}

export function popHistory() {
	const history = loadHistory();

	// Need at least one previous state to undo
	if (history.length <= 1) return null;

	history.pop(); // remove current snapshot
	const previousSnapshot = history[history.length - 1];

	saveToStorage(STORAGE_KEY.history, history);
	return previousSnapshot;
}
