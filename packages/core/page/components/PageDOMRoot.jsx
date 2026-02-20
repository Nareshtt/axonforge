import { usePageStore } from "../../stores/pageStore";
import { useViewport } from "../../stores/useViewport";
import { PageDOM } from "./PageDOM";

export function PageDOMRoot() {
	const pages = usePageStore((s) => s.pages);

	// Use separate primitive selectors to avoid creating a new object each render
	// (which would cause an infinite re-render loop with Zustand)
	const x = useViewport((s) => s.x);
	const y = useViewport((s) => s.y);
	const scale = useViewport((s) => s.scale);

	const viewport = { x, y, scale };

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				pointerEvents: "none",
				overflow: "hidden",
				zIndex: 1,
			}}
		>
			{pages.map((page) => (
				<PageDOM key={page.id} page={page} viewport={viewport} />
			))}
		</div>
	);
}
