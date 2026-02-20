import { Application, Graphics } from "pixi.js";
import { useEffect, useRef, useState } from "react";

const GRID_SIZE = 5000;
const GRID_STEP = 50;
const BACKGROUND_COLOR = 0x18181b; // Solid Zinc-900

export function usePixiApp(containerRef) {
	const [app, setApp] = useState(null);

	useEffect(() => {
		if (!containerRef.current) return;

		let canceled = false;
		let pixiApp = null;
		let resizeObserver = null;

		const initApp = async () => {
			try {
				pixiApp = new Application();
				// Don't use resizeTo in init — it causes crashes on destroy in some v8 versions/race conditions
				await pixiApp.init({
					background: "#18181b", // Solid Zinc-900
					antialias: true,
					resolution: window.devicePixelRatio || 1,
					autoDensity: true,
					width: containerRef.current.clientWidth,
					height: containerRef.current.clientHeight,
				});

				if (canceled || !containerRef.current) {
					try {
						pixiApp.destroy(true, { children: true });
					} catch (e) {
						console.warn(e);
					}
					return;
				}

				// Enable z-index sorting for layers
				pixiApp.stage.sortableChildren = true;

				containerRef.current.appendChild(pixiApp.canvas);
				setApp(pixiApp);

				// Manual resize handling is more robust than resizeTo for React lifecycle
				resizeObserver = new ResizeObserver((entries) => {
					if (!pixiApp || !pixiApp.renderer) return;
					for (const entry of entries) {
						const { width, height } = entry.contentRect;
						pixiApp.renderer.resize(width, height);
					}
				});
				resizeObserver.observe(containerRef.current);
			} catch (err) {
				console.error("Pixi Init Failed:", err);
			}
		};

		initApp();

		return () => {
			canceled = true;
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
			if (pixiApp) {
				try {
					pixiApp.destroy(true, { children: true });
				} catch (e) {
					console.warn("Pixi destroy error:", e);
				}
			}
			setApp(null);
		};
	}, [containerRef]);

	return app;
}

export { GRID_SIZE, GRID_STEP, BACKGROUND_COLOR };
