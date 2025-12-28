import { useEditorStore } from "../stores/editorStore";
import { usePageStore } from "../stores/pageStore";
import { useTimelineViewport } from "../stores/useTimelineViewport";
import { Commands } from "./commands";
import { resetMousePosition } from "./mouse";

let initialized = false;

export function initKeyboard() {
	if (initialized) return;
	initialized = true;

	let isPanKeyActive = false;

	const onKeyDown = (e) => {
		if (e.repeat) return;

		/* ---------- TYPING GUARD ---------- */
		const target = e.target;
		const isTyping =
			target instanceof HTMLInputElement ||
			target instanceof HTMLTextAreaElement ||
			target.isContentEditable;

		if (isTyping) return;

		const {
			mode,
			selectedPageId,
			isMoving,
			setIsMoving,
			axisConstraint,
			setAxisConstraint,
			focusedSurface,
		} = useEditorStore.getState();

		// Shift + T → toggle timeline
		if (e.shiftKey && e.key.toLowerCase() === "t") {
			e.preventDefault();
			useEditorStore.getState().toggleTimeline();
			return;
		}

		/* ---------- TIMELINE-SPECIFIC CONTROLS ---------- */
		if (focusedSurface === "timeline") {
			// Ctrl+Z → Undo in timeline
			if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				if (window.__timelineUndo) window.__timelineUndo();
				return;
			}

			// Ctrl+Shift+Z or Ctrl+Y → Redo in timeline
			if (
				(e.ctrlKey || e.metaKey) &&
				((e.shiftKey && e.key === "z") || e.key === "y")
			) {
				e.preventDefault();
				if (window.__timelineRedo) window.__timelineRedo();
				return;
			}

			// R → Reset timeline view
			if (e.key === "r" && !e.ctrlKey && !e.metaKey) {
				e.preventDefault();
				useTimelineViewport.getState().reset();
				return;
			}

			// Don't process canvas shortcuts when timeline is focused
			return;
		}

		/* ---------- CANVAS UNDO ---------- */
		if ((e.ctrlKey || e.metaKey) && e.key === "z") {
			e.preventDefault();
			usePageStore.getState().undo();
			return;
		}

		/* ---------- PAN ---------- */
		if (e.ctrlKey && e.shiftKey && !isPanKeyActive) {
			e.preventDefault();
			isPanKeyActive = true;
			Commands.panStart();
			return;
		}

		/* ---------- MODE ---------- */
		if (e.code === "Tab") {
			e.preventDefault();
			Commands.toggleMode();
			return;
		}

		/* ---------- SNAP ---------- */
		if (e.altKey && e.key === "g" && mode === "view" && selectedPageId) {
			e.preventDefault();
			Commands.snapPageToOrigin(selectedPageId);
			return;
		}

		/* ---------- MOVE ---------- */
		if (e.key === "g" && mode === "view" && selectedPageId && !e.altKey) {
			e.preventDefault();
			resetMousePosition();
			setIsMoving(!isMoving);
			return;
		}

		/* ---------- AXIS CONSTRAINT ---------- */
		if (e.key === "x" && isMoving) {
			e.preventDefault();
			setAxisConstraint(axisConstraint === "x" ? null : "x");
			return;
		}

		if (e.key === "y" && isMoving) {
			e.preventDefault();
			setAxisConstraint(axisConstraint === "y" ? null : "y");
			return;
		}

		/* ---------- ARROW MOVE ---------- */
		if (mode === "view" && selectedPageId) {
			const arrows = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

			if (arrows.includes(e.code)) {
				e.preventDefault();

				const step = e.shiftKey ? 100 : 10;

				let dx = 0;
				let dy = 0;

				switch (e.code) {
					case "ArrowUp":
						dy = -step;
						break;
					case "ArrowDown":
						dy = step;
						break;
					case "ArrowLeft":
						dx = -step;
						break;
					case "ArrowRight":
						dx = step;
						break;
				}

				if (axisConstraint === "x") dy = 0;
				if (axisConstraint === "y") dx = 0;

				Commands.movePageBy(selectedPageId, dx, dy);
				return;
			}
		}

		/* ---------- CANCEL MOVE ---------- */
		if (e.key === "Escape" && isMoving) {
			e.preventDefault();
			setIsMoving(false);
			setAxisConstraint(null);
			resetMousePosition();
		}
	};

	const onKeyUp = (e) => {
		if ((e.key === "Control" || e.key === "Shift") && isPanKeyActive) {
			isPanKeyActive = false;
			resetMousePosition();
			Commands.panEnd();
		}
	};

	document.addEventListener("keydown", onKeyDown, true);
	document.addEventListener("keyup", onKeyUp, true);
}
