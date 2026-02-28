import { useEffect, useRef } from "react";
import { Graphics, Text, Container } from "pixi.js";
import { useViewport } from "../../stores/useViewport";

const DEFAULT_PAGE_WIDTH = 400;
const DEFAULT_PAGE_HEIGHT = 300;
const PAGE_BG_COLOR = 0xffffff;
const SELECTED_BORDER_COLOR = 0x6366f1;
const LABEL_FONT = "Inter, sans-serif";
const LABEL_SIZE = 60;
const LABEL_COLOR = 0x9ca3af; // Zinc-400 for dark mode readability
const BORDER_WIDTH = 2;
const LABEL_OFFSET_X = 8;
const LABEL_OFFSET_Y = -64;

export function PageLayer({ app, pages, selectedPageId, mode, onSelectPage }) {
	const containerRef = useRef(null);

	// 1. Mount container once
	useEffect(() => {
		if (!app) return;
		const container = new Container();
		container.zIndex = 30;
		app.stage.addChild(container);
		containerRef.current = container;

		return () => {
			container.destroy({ children: true });
			containerRef.current = null;
		};
	}, [app]);

	// 2. Sync children
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Simple Diffing / Re-use Strategy
		// Mark all existing children as stale
		const childrenMap = new Map();
		container.children.forEach((c) => childrenMap.set(c.label, c));
		const activeLabels = new Set();

		pages.forEach((page) => {
			const pageLabel = `page-${page.id}`;
			activeLabels.add(pageLabel);

			let pageContainer = childrenMap.get(pageLabel);

			// Compute Props
			const pageX = (page.cx ?? 0) - (page.width ?? DEFAULT_PAGE_WIDTH) / 2;
			const pageY = (page.cy ?? 0) - (page.height ?? DEFAULT_PAGE_HEIGHT) / 2;
			const pageW = page.width ?? DEFAULT_PAGE_WIDTH;
			const pageH = page.height ?? DEFAULT_PAGE_HEIGHT;
			const isSelected = selectedPageId === page.id;

			// Create if new
			if (!pageContainer) {
				pageContainer = new Container();
				pageContainer.label = pageLabel;

				const bg = new Graphics();
				bg.label = "bg";
				pageContainer.addChild(bg);

				const border = new Graphics();
				border.label = "border";
				pageContainer.addChild(border); // always add, just hide/show or clear

				const text = new Text({
					text: page.name || page.id,
					style: {
						fontFamily: LABEL_FONT,
						fontSize: LABEL_SIZE,
						fill: LABEL_COLOR,
					},
				});
				text.label = "text";
				pageContainer.addChild(text);

				// Interaction
				bg.eventMode = "static";
				bg.on("pointerdown", (e) => {
					// We need to capture the current pageId from closure or data
					// But closure `page.id` is fresh in this loop
					e.stopPropagation();
					// Emit event with ID attached to container or just use closure
					// Closure is safe because we create handlers once?
					// Actually, if we reuse container, we reuse handlers.
					// We should attach ID to container and read it.
				});
				// Fix: Handler needs to call LATEST onSelectPage.
				// Since we reuse graphics, we can't bake closure.
				// Store ID on container.
				pageContainer.pageId = page.id;

				container.addChild(pageContainer);
			}

			// Update Props (Always update to handle drag)
			pageContainer.x = pageX;
			pageContainer.y = pageY;
			pageContainer.pageWidth = pageW; // Store for ticker access

			// Update BG - Make invisible to prevent ghosting/trails (PageDOM handles visuals)
			const bg = pageContainer.children.find((c) => c.label === "bg");
			bg.clear();
			bg.rect(0, 0, pageW, pageH); // Local coords
			// Interactive but invisible
			bg.fill({ color: 0x000000, alpha: 0.0001 });

			// Update Border - Removed to prevent double-border/trails (PageDOM handles output)
			const border = pageContainer.children.find((c) => c.label === "border");
			border.clear();
			// Border logic removed - relying on CSS outline in PageDOM
			/*
			if (isSelected) {
				border.rect(
					-BORDER_WIDTH,
					-BORDER_WIDTH,
					pageW + BORDER_WIDTH * 2,
					pageH + BORDER_WIDTH * 2
				);
				border.stroke({ color: SELECTED_BORDER_COLOR, width: BORDER_WIDTH });
			}
			*/

			// Update Text
			const text = pageContainer.children.find((c) => c.label === "text");
			if (text) {
				const baseName = page.name || page.id;
				const showCode = mode === "edit" && isSelected;
				const fullString = showCode ? `</> ${baseName}` : baseName;
				// Cache metrics if changed
				if (text.fullText !== fullString) {
					text.text = fullString; // Set temporarily to measure
					text.fullText = fullString;
					text.scale.set(1); // Normalize scale to measure natural width
					text.fullWidth = text.width;
					text.lastTruncated = false; // Reset state
				}

				text.x = LABEL_OFFSET_X;
				text.y = LABEL_OFFSET_Y;
			}

			// Update Interaction
			// In Pixi v8, use pointer events (not `onclick`).
			bg.removeAllListeners("pointerdown");
			const labelText = pageContainer.children.find((c) => c.label === "text");
			if (labelText) {
				labelText.removeAllListeners("pointerdown");
				labelText.eventMode = "static";
				labelText.cursor = "pointer";
				labelText.on("pointerdown", (e) => {
					e.stopPropagation();
					onSelectPage(page.id);
				});
			}
			if (mode === "view") {
				bg.eventMode = "static";
				bg.cursor = "pointer";
				bg.on("pointerdown", (e) => {
					e.stopPropagation();
					onSelectPage(page.id);
				});
			} else {
				bg.eventMode = "none";
				bg.cursor = "default";
			}
		});

		// Remove stale children
		childrenMap.forEach((child, label) => {
			if (!activeLabels.has(label)) {
				child.destroy({ children: true });
			}
		});
	}, [pages, selectedPageId, mode, onSelectPage]); // Re-run when data changes. But we reuse containers!

	// 3. Ticker Loop for Constant Screen Size Text + Smart Truncation
	useEffect(() => {
		if (!app) return;

		const onTick = () => {
			const { scale } = useViewport.getState();
			// Constant screen size factor
			const invScale = 1 / scale;

			const container = containerRef.current;
			if (!container) return;

			// Need map to find page data for width constraint
			// Assuming child index matches? No.
			// Map children by pageId?
			// We attached pageId to container.
			// And we have `pages` prop in closure (stale?).
			// Actually `useEffect` dependencies updated `pages`, but this effect has `[app]` dependency only.
			// BUG: `pages` inside this effect will be stale (initial render).
			// FIX: Use ref for pages lookup or iterate children and rely on stored data?
			// We can store `pageWidth` on the container in the sync loop!

			// PASS 1: Find the Global Minimum Scale
			// We want all texts to be the SAME size.
			// That size should be the minimum of:
			// A) The ideal constant size (invScale)
			// B) The scaled-down size required by the "worst case" label (longest text on narrowest page)

			let globalMinScale = invScale;

			container.children.forEach((pageContainer) => {
				const text = pageContainer.children.find((c) => c.label === "text");
				if (!text || !text.fullText) return;

				const pageWidth = pageContainer.pageWidth || DEFAULT_PAGE_WIDTH;
				const fullWidth = text.fullWidth || 100;

				// Constraint: textWidth * scale <= pageWidth * 0.75
				// scale <= (pageWidth * 0.75) / textWidth
				const constraintScale = (pageWidth * 0.75) / fullWidth;

				if (constraintScale < globalMinScale) {
					globalMinScale = constraintScale;
				}
			});

			// PASS 2: Apply Global Minimum Scale to All
			container.children.forEach((pageContainer) => {
				const text = pageContainer.children.find((c) => c.label === "text");
				if (!text || !text.fullText) return;

				text.scale.set(globalMinScale);
				text.x = LABEL_OFFSET_X * globalMinScale;
				text.y = LABEL_OFFSET_Y * globalMinScale;

				// Ensure full text is always shown (no truncation)
				if (text.text !== text.fullText) {
					text.text = text.fullText;
				}
			});
		};

		app.ticker.add(onTick);
		return () => {
			if (app && app.ticker) {
				app.ticker.remove(onTick);
			}
		};
	}, [app]);

	return null;
}
