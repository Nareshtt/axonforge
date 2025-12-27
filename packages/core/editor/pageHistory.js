const STORAGE_KEY = "axonforge:page-history";
const MAX_HISTORY = 15;

export function loadHistory() {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
	} catch {
		return [];
	}
}

export function pushHistory(layout) {
	const history = loadHistory();

	history.push(layout);

	if (history.length > MAX_HISTORY) {
		history.shift(); // drop oldest
	}

	localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function popHistory() {
	const history = loadHistory();
	if (history.length <= 1) return null;

	history.pop(); // remove current
	const prev = history[history.length - 1];

	localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
	return prev;
}
