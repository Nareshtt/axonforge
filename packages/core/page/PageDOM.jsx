import { pageModules } from "./pageModules";

export function PageDOM({ page }) {
	// Guard: page not ready yet
	if (!page.render) return null;

	const key =
		page.id === "home"
			? "/src/pages/page.jsx"
			: `/src/pages/${page.id}/page.jsx`;

	const Mod = pageModules[key]?.default;
	if (!Mod) return null;

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
