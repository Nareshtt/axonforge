import { pageModules } from "./pageModules";

export function PageDOM({ page }) {
	// Guard: page not ready yet
	if (!page.render) return null;

	// 🔑 Fixed: Check for "Home" (uppercase) and use correct path
	const key =
		page.id === "Home"
			? "/src/pages/page.jsx"
			: `/src/pages/${page.id}/page.jsx`;

	const Mod = pageModules[key]?.default;

	if (!Mod) {
		console.warn(
			`[PageDOM] Module not found for page "${page.id}" at key: ${key}`
		);
		console.log("[PageDOM] Available modules:", Object.keys(pageModules));
		return null;
	}

	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,

				/* Apply the computed screen-space transform */
				transform: `
					translate(${page.render.x}px, ${page.render.y}px)
					scale(${page.render.scale})
				`,
				transformOrigin: "top left",

				width: page.width,
				height: page.height,
				overflow: "hidden",

				// Disable pointer events by default (enable selectively when editing)
				pointerEvents: "none",
				background: "transparent",
			}}
		>
			<Mod />
		</div>
	);
}
