// In keyboard.js - add X and Y key handlers
import { useEditorStore } from "../stores/editorStore";
import { Commands } from "./commands";
import { resetMousePosition } from "./mouse";

let initialized = false;

export function initKeyboard() {
	if (initialized) return;
	initialized = true;

	let isPanKeyActive = false;

	const onKeyDown = (e) => {
		if (e.repeat) return;
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
		} = useEditorStore.getState();

		// Ctrl + Shift → pan
		if (e.ctrlKey && e.shiftKey && !isPanKeyActive) {
			e.preventDefault();
			isPanKeyActive = true;
			Commands.panStart();
			return;
		}

		// Tab → toggle mode
		if (e.code === "Tab") {
			e.preventDefault();
			Commands.toggleMode();
			return;
		}

		// Alt + G → snap selected page to origin (0, 0)
		if (e.altKey && e.key === "g" && mode === "view" && selectedPageId) {
			e.preventDefault();
			Commands.snapPageToOrigin(selectedPageId);
			return;
		}

		// G → move selected page
		if (e.key === "g" && mode === "view" && selectedPageId && !e.altKey) {
			e.preventDefault();
			resetMousePosition();
			setIsMoving(!isMoving);
		}

		// X → constrain to X axis (only in move mode)
		if (e.key === "x" && isMoving) {
			e.preventDefault();
			// Toggle: if already X, turn off constraint; otherwise set to X
			setAxisConstraint(axisConstraint === "x" ? null : "x");
		}

		// Y → constrain to Y axis (only in move mode)
		if (e.key === "y" && isMoving) {
			e.preventDefault();
			// Toggle: if already Y, turn off constraint; otherwise set to Y
			setAxisConstraint(axisConstraint === "y" ? null : "y");
		}

		// Arrow keys → move selected page (in move mode or directly)
		if (mode === "view" && selectedPageId) {
			const isArrowKey = [
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight",
			].includes(e.code);

			if (isArrowKey) {
				e.preventDefault();

				// Determine step size: Shift = large step (100), normal = small step (10)
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

				// Apply axis constraint if active
				if (axisConstraint === "x") dy = 0;
				if (axisConstraint === "y") dx = 0;

				Commands.movePageBy(selectedPageId, dx, dy);
				return;
			}
		}

		// Escape → cancel move
		if (e.key === "Escape" && isMoving) {
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
