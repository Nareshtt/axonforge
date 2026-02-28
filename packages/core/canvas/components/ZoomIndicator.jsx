import { useViewport } from "../../stores/useViewport";
import { useEditorStore } from "../../stores/editorStore";
import { usePageStore } from "../../stores/pageStore";

export function ZoomIndicator() {
	const scale = useViewport((s) => s.scale);
	const zoomTo = useViewport((s) => s.zoomTo);
	const x = useViewport((s) => s.x);
	const y = useViewport((s) => s.y);

	const selectedPageId = useEditorStore((s) => s.selectedPageId);
	const timelineOpen = useEditorStore((s) => s.timelineOpen);
	const leftSidebarWidth = useEditorStore((s) => s.leftSidebarWidth);
	const pages = usePageStore((s) => s.pages);

	const percentage = Math.round(scale * 100);

	const getZoomCenter = () => {
		if (selectedPageId) {
			const page = pages.find((p) => p.id === selectedPageId);
			if (page) {
				const screenX = x + (page.cx ?? 0) * scale;
				const screenY = y + (page.cy ?? 0) * scale;
				return { cx: screenX, cy: screenY };
			}
		}
		return { cx: window.innerWidth / 2, cy: window.innerHeight / 2 };
	};

	const handleZoomIn = () => {
		const newScale = Math.min(5, scale * 1.2);
		const { cx, cy } = getZoomCenter();
		zoomTo(newScale, cx, cy);
	};

	const handleZoomOut = () => {
		const newScale = Math.max(0.05, scale / 1.2);
		const { cx, cy } = getZoomCenter();
		zoomTo(newScale, cx, cy);
	};

	const handleReset = () => {
		const { cx, cy } = getZoomCenter();
		zoomTo(1, cx, cy);
	};

	return (
		<div
			className="fixed bg-[#0a0a0a] text-[#888] px-3 py-1.5 rounded text-xs font-medium border border-[#1f1f1f] flex items-center gap-3 select-none z-30 pointer-events-auto"
			style={{
				left: Math.max(16, (leftSidebarWidth || 0) + 16),
				bottom: timelineOpen ? 288 + 16 : 16,
			}}
		>
			<button
				onClick={handleZoomOut}
				className="hover:text-white focus:outline-none w-6 h-6 flex items-center justify-center bg-[#1a1a1a] rounded hover:bg-[#252525]"
			>
				−
			</button>
			<button
				onClick={handleReset}
				className="min-w-[40px] text-center hover:text-white focus:outline-none"
				title="Reset to 100%"
			>
				{percentage}%
			</button>
			<button
				onClick={handleZoomIn}
				className="hover:text-white focus:outline-none w-6 h-6 flex items-center justify-center bg-[#1a1a1a] rounded hover:bg-[#252525]"
			>
				+
			</button>
		</div>
	);
}
