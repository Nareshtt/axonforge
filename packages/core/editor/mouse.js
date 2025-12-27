// mouse.js
import { Commands } from "./commands";
import { useEditorStore } from "../stores/editorStore";
import { usePageStore } from "../stores/pageStore";
import { useViewport } from "../canvas/useViewport";

let initialized = false;
let lastPos = null;
let moveStartPosition = null;

export function resetMousePosition() {
	lastPos = null;
}

export function initMouse() {
	if (initialized) return;
	initialized = true;

	let panSource = null;

	const onMouseDown = (e) => {
		const { isMoving, setIsMoving, selectedPageId, setAxisConstraint } =
			useEditorStore.getState();

		/* ---------- CONFIRM / CANCEL MOVE ---------- */
		if (isMoving && selectedPageId) {
			// Left click → confirm
			if (e.button === 0) {
				e.preventDefault();
				e.stopPropagation();

				setIsMoving(false);
				setAxisConstraint(null);
				lastPos = null;
				moveStartPosition = null;

				// ✅ COMMIT UNDO STATE
				usePageStore.getState().commitMove();
				return false;
			}

			// Right click → cancel (handled on mouseup)
			if (e.button === 2) {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				return false;
			}
		}

		/* ---------- PAN ---------- */
		if (e.button === 1) {
			e.preventDefault();
			lastPos = { x: e.clientX, y: e.clientY };
			panSource = "middle";
			Commands.panStart();
		}
	};

	const onMouseMove = (e) => {
		const { isPanning, isMoving, selectedPageId, axisConstraint } =
			useEditorStore.getState();

		/* ---------- PAGE MOVE ---------- */
		if (isMoving && selectedPageId) {
			if (!lastPos) {
				if (!moveStartPosition) {
					const page = usePageStore
						.getState()
						.pages.find((p) => p.id === selectedPageId);
					if (page) {
						moveStartPosition = { cx: page.cx, cy: page.cy };
					}
				}

				lastPos = { x: e.clientX, y: e.clientY };
				return;
			}

			let dxScreen = e.clientX - lastPos.x;
			let dyScreen = e.clientY - lastPos.y;

			if (axisConstraint === "x") dyScreen = 0;
			if (axisConstraint === "y") dxScreen = 0;

			const { scale } = useViewport.getState();

			usePageStore
				.getState()
				.movePageBy(selectedPageId, dxScreen / scale, dyScreen / scale);

			lastPos = { x: e.clientX, y: e.clientY };
			return;
		}

		/* ---------- PAN ---------- */
		if (!isPanning) {
			lastPos = null;
			return;
		}

		if (!lastPos) {
			lastPos = { x: e.clientX, y: e.clientY };
			return;
		}

		Commands.panBy(e.clientX - lastPos.x, e.clientY - lastPos.y);
		lastPos = { x: e.clientX, y: e.clientY };
	};

	const onMouseUp = (e) => {
		const { isMoving, setIsMoving, selectedPageId, setAxisConstraint } =
			useEditorStore.getState();

		/* ---------- CANCEL MOVE ---------- */
		if (isMoving && selectedPageId && e.button === 2) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();

			if (moveStartPosition) {
				usePageStore
					.getState()
					.setPagePosition(
						selectedPageId,
						moveStartPosition.cx,
						moveStartPosition.cy
					);
			}

			setIsMoving(false);
			setAxisConstraint(null);
			lastPos = null;
			moveStartPosition = null;
			return false;
		}

		if (isMoving) return;

		panSource = null;
		lastPos = null;
		Commands.panEnd();
	};

	/* ---------- CONTEXT MENU BLOCK ---------- */
	const onContextMenu = (e) => {
		const { isMoving } = useEditorStore.getState();
		if (isMoving) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			return false;
		}
	};

	document.addEventListener("mousedown", onMouseDown, true);
	document.addEventListener("mousemove", onMouseMove, true);
	document.addEventListener("mouseup", onMouseUp, true);
	document.addEventListener("contextmenu", onContextMenu, true);
}
