import { useEffect } from "react";
import { Graphics } from "pixi.js";
import { BACKGROUND_COLOR } from "../hooks/usePixiApp";

export function BackgroundLayer({
	app,
	onClearSelection,
	onSetFocusedSurface,
}) {
	useEffect(() => {
		if (!app) return;

		const bgGraphics = new Graphics();
		const bgSize = 100000;

		bgGraphics.rect(-bgSize / 2, -bgSize / 2, bgSize, bgSize);
		bgGraphics.fill({ color: BACKGROUND_COLOR });
		bgGraphics.eventMode = "static";
		bgGraphics.zIndex = 0; // Layer 0

		if (onClearSelection && onSetFocusedSurface) {
			bgGraphics.on("pointerdown", () => {
				onSetFocusedSurface("canvas");
				onClearSelection();
			});
		}

		app.stage.addChild(bgGraphics);

		return () => {
			bgGraphics.destroy();
		};
	}, [app, onClearSelection, onSetFocusedSurface]);

	return null;
}
