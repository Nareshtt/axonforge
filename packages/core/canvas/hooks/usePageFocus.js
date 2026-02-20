import { useCallback } from "react";
import { useViewport } from "../../stores/useViewport";

export function usePageFocus() {
	const focusOnPage = useViewport((s) => s.focusOnPage);

	const focusOnPageById = useCallback(
		(page, screenWidth, screenHeight) => {
			if (!page) return;
			focusOnPage(page, screenWidth, screenHeight);
		},
		[focusOnPage]
	);

	return { focusOnPageById };
}
