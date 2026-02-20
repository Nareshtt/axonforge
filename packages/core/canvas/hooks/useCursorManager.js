import { useEffect } from "react";

const DEFAULT_CURSOR = "default";
const PANNING_CURSOR = "grabbing";

export function useCursorManager(isPanning) {
	useEffect(() => {
		document.body.style.cursor = isPanning ? PANNING_CURSOR : DEFAULT_CURSOR;
		return () => {
			document.body.style.cursor = DEFAULT_CURSOR;
		};
	}, [isPanning]);
}
