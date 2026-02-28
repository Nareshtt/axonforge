import { Commands } from "./commands";
import { useEditorStore } from "../stores/editorStore";
import { usePageStore } from "../stores/pageStore";
import { useViewport } from "../stores/useViewport";
import { useTimelineViewport } from "../stores/useTimelineViewport";

let initialized = false;
let lastPos = null;
let moveStartPosition = null;

export function resetMousePosition() {
	lastPos = null;
	moveStartPosition = null;
}

export function initMouse() {
	if (initialized) return;
	initialized = true;

	const getEventTargetElement = (e) => {
		const t = e?.target;
		if (t instanceof Element) return t;
		if (t && t.parentElement instanceof Element) return t.parentElement;
		if (t && t.parentNode instanceof Element) return t.parentNode;
		return null;
	};

	const surfaceFromEvent = (e) => {
		const el = getEventTargetElement(e);
		if (!el) return "canvas";
		if (el.closest("[data-timeline]")) return "timeline";
		if (
			el.closest("[data-left-sidebar]") ||
			el.closest("[data-sidebar]") ||
			el.closest("[data-topbar]")
		)
			return "sidebar";
		return "canvas";
	};

	const syncFocusedSurface = (e) => {
		const state = useEditorStore.getState();
		// If timeline pan is keyboard-driven, keep timeline focused.
		const next = state.isTimelinePanning ? "timeline" : surfaceFromEvent(e);
		if (state.focusedSurface !== next) state.setFocusedSurface(next);
		return next;
	};

	let panSource = null;

	const onMouseDown = (e) => {
		const focusedSurface = syncFocusedSurface(e);
		const { isTimelinePanning } = useEditorStore.getState();

		/* ---------- SIDEBAR FOCUS - Skip canvas events ---------- */
		if (focusedSurface === "sidebar") {
			return;
		}

		/* ---------- TIMELINE PANNING ---------- */
		if (focusedSurface === "timeline") {
			// Middle click or left click when keyboard initiated timeline pan
			if (e.button === 1 || (e.button === 0 && isTimelinePanning)) {
				e.preventDefault();
				lastPos = { x: e.clientX, y: e.clientY };
				panSource = "timeline";
				document.body.style.cursor = "grabbing";
				return;
			}
			// Don't process canvas mouse events when timeline is focused
			return;
		}

		const { isMoving, setIsMoving, selectedPageId, setAxisConstraint } =
			useEditorStore.getState();

		/* ---------- HANDLE MOVE MODE ---------- */
		if (isMoving && selectedPageId) {
			// Left click → confirm move
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

			// Right click → prepare to cancel (actual cancel happens on mouseup)
			if (e.button === 2) {
				e.preventDefault();
				e.stopPropagation();
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
		const focusedSurface = syncFocusedSurface(e);

		/* ---------- TIMELINE PANNING (Keyboard triggered - no click needed) ---------- */
		if (focusedSurface === "timeline") {
			const { isTimelinePanning } = useEditorStore.getState();

			// When Ctrl+Shift is pressed (keyboard initiated), track movement without click
			if (isTimelinePanning) {
				if (!lastPos) {
					lastPos = { x: e.clientX, y: e.clientY };
					return;
				}

				const dx = e.clientX - lastPos.x;
				const dy = e.clientY - lastPos.y;

				useTimelineViewport.getState().pan(dx, dy);
				lastPos = { x: e.clientX, y: e.clientY };
				return;
			}
		}

		/* ---------- TIMELINE PANNING (Mouse triggered) ---------- */
		if (panSource === "timeline") {
			if (!lastPos) {
				lastPos = { x: e.clientX, y: e.clientY };
				return;
			}

			const dx = e.clientX - lastPos.x;
			const dy = e.clientY - lastPos.y;

			useTimelineViewport.getState().pan(dx, dy);
			lastPos = { x: e.clientX, y: e.clientY };
			return;
		}

		const { isPanning, isMoving, selectedPageId, axisConstraint } =
			useEditorStore.getState();

		/* ---------- PAGE MOVE ---------- */
		if (isMoving && selectedPageId) {
			// Store initial position on first move
			if (!moveStartPosition) {
				const page = usePageStore
					.getState()
					.pages.find((p) => p.id === selectedPageId);
				if (page) {
					moveStartPosition = { cx: page.cx, cy: page.cy };
				}
			}

			if (!lastPos) {
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
		/* ---------- TIMELINE PAN END ---------- */
		if (panSource === "timeline") {
			panSource = null;
			lastPos = null;
			document.body.style.cursor = "default";
			return;
		}

		const { isMoving, setIsMoving, selectedPageId, setAxisConstraint } =
			useEditorStore.getState();

		/* ---------- CANCEL MOVE WITH RIGHT CLICK ---------- */
		if (isMoving && selectedPageId && e.button === 2) {
			e.preventDefault();
			e.stopPropagation();

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
			resetMousePosition();
			return false;
		}

		/* ---------- END PAN ---------- */
		if (e.button === 1 || panSource === "middle") {
			panSource = null;
			lastPos = null;
			Commands.panEnd();
		}
	};

	/* ---------- CONTEXT MENU BLOCK ---------- */
	const onContextMenu = (e) => {
		const { isMoving } = useEditorStore.getState();
		if (isMoving) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	};

	// Use capture phase to intercept events early
	document.addEventListener("mousedown", onMouseDown, true);
	document.addEventListener("mousemove", onMouseMove, false);
	document.addEventListener("mouseup", onMouseUp, true);
	document.addEventListener("contextmenu", onContextMenu, true);
}
