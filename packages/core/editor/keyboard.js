import { Commands } from "./commands";
import { resetMousePosition } from "./mouse";

let initialized = false;

export function initKeyboard() {
	if (initialized) return;
	initialized = true;

	let isPanKeyActive = false;

	const onKeyDown = (e) => {
		if (e.repeat) return;

		// Ctrl + Shift → pan (laptop users)
		if (e.ctrlKey && e.shiftKey && !isPanKeyActive) {
			e.preventDefault();
			isPanKeyActive = true;
			Commands.panStart();
			return;
		}

		// Tab → mode toggle
		if (e.code === "Tab") {
			e.preventDefault();
			Commands.toggleMode();
		}
	};

	const onKeyUp = (e) => {
		// Release pan when either Ctrl or Shift is released
		if ((e.key === "Control" || e.key === "Shift") && isPanKeyActive) {
			isPanKeyActive = false;
			resetMousePosition();
			Commands.panEnd();
		}
	};

	document.addEventListener("keydown", onKeyDown, true);
	document.addEventListener("keyup", onKeyUp, true);
}
