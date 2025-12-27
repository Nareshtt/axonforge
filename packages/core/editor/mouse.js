import { Commands } from "./commands";
import { useEditorStore } from "../stores/editorStore";

let initialized = false;
let lastPos = null;

export function resetMousePosition() {
	lastPos = null;
}

export function initMouse() {
	if (initialized) return;
	initialized = true;

	let panSource = null;

	const onMouseDown = (e) => {
		if (e.button === 1) {
			e.preventDefault();
			lastPos = { x: e.clientX, y: e.clientY };
			panSource = "middle";
			Commands.panStart();
		}
	};

	const onMouseMove = (e) => {
		const { isPanning } = useEditorStore.getState();

		if (!isPanning) {
			if (lastPos) lastPos = null;
			return;
		}

		if (!lastPos) {
			lastPos = { x: e.clientX, y: e.clientY };
			return;
		}

		const dx = e.clientX - lastPos.x;
		const dy = e.clientY - lastPos.y;

		Commands.panBy(dx, dy);

		lastPos = { x: e.clientX, y: e.clientY };
	};

	const onMouseUp = (e) => {
		if (e.button === 1 && panSource === "middle") {
			lastPos = null;
			panSource = null;
			Commands.panEnd();
		}
	};

	window.addEventListener("mousedown", onMouseDown);
	window.addEventListener("mousemove", onMouseMove);
	window.addEventListener("mouseup", onMouseUp);
}
