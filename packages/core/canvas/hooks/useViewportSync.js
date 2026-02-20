import { useEffect } from "react";

export function useViewportSync(app, x, y, scale) {
	useEffect(() => {
		if (!app) return;
		app.stage.position.set(x, y);
		app.stage.scale.set(scale);
	}, [app, x, y, scale]);
}
