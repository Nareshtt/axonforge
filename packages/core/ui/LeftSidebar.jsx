import { useEffect, useRef, useState } from "react";
import {
	ChevronDown,
	ChevronRight,
	ChevronLeft,
	Layers,
	FileText,
} from "lucide-react";

import { usePageStore } from "../stores/pageStore";
import { useEditorStore } from "../stores/editorStore";

/* ---- constants ---- */
const ICON_RAIL_WIDTH = 48;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 256;

export function LeftSidebar() {
	const [width, setWidth] = useState(DEFAULT_WIDTH);
	const [isResizing, setIsResizing] = useState(false);

	const [pagesExpanded, setPagesExpanded] = useState(true);
	const [layersExpanded, setLayersExpanded] = useState(true);

	const sidebarRef = useRef(null);
	const lastExpandedWidthRef = useRef(DEFAULT_WIDTH);

	/* ---- state ---- */
	const pages = usePageStore((s) => s.pages);
	const selectedPageId = useEditorStore((s) => s.selectedPageId);
	const selectPage = useEditorStore((s) => s.selectPage);

	/* ---------------- Resize logic ---------------- */

	useEffect(() => {
		if (!isResizing) return;

		const onMouseMove = (e) => {
			const { left } = sidebarRef.current.getBoundingClientRect();
			const raw = e.clientX - left;

			const clamped = Math.max(ICON_RAIL_WIDTH, Math.min(MAX_WIDTH, raw));

			setWidth(clamped);

			if (clamped > ICON_RAIL_WIDTH) {
				lastExpandedWidthRef.current = clamped;
			}
		};

		const onMouseUp = () => {
			setIsResizing(false);
			document.body.style.cursor = "default";
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);

		return () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};
	}, [isResizing]);

	const startResize = (e) => {
		e.preventDefault();
		setIsResizing(true);
		document.body.style.cursor = "col-resize";
	};

	/* ---------------- Toggle (distance-based, fixed) ---------------- */

	const handleToggle = () => {
		if (width === ICON_RAIL_WIDTH) {
			setWidth(lastExpandedWidthRef.current);
			return;
		}

		if (width === lastExpandedWidthRef.current) {
			setWidth(ICON_RAIL_WIDTH);
			return;
		}

		const dCollapsed = Math.abs(width - ICON_RAIL_WIDTH);
		const dExpanded = Math.abs(width - lastExpandedWidthRef.current);

		setWidth(
			dCollapsed < dExpanded ? ICON_RAIL_WIDTH : lastExpandedWidthRef.current
		);
	};

	const visuallyCollapsed = width <= ICON_RAIL_WIDTH + 1;

	return (
		<div
			ref={sidebarRef}
			className="
				fixed top-12 left-0 bottom-0
				bg-[#111]
				border-r border-neutral-800
				text-neutral-300 text-sm
				select-none
				z-40
			"
			style={{
				width,
				transition: isResizing ? "none" : "width 0.2s ease",
			}}
		>
			{/* Header */}
			<div className="h-10 flex items-center justify-between px-2 border-b border-neutral-800/50">
				{!visuallyCollapsed && (
					<span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
						Explorer
					</span>
				)}

				<button
					onClick={handleToggle}
					className={`w-7 h-7 rounded hover:bg-neutral-800 ${
						visuallyCollapsed ? "mx-auto" : ""
					}`}
				>
					<ChevronLeft
						size={16}
						className={visuallyCollapsed ? "rotate-180" : ""}
					/>
				</button>
			</div>

			{/* Content */}
			{visuallyCollapsed ? (
				<div className="flex flex-col items-center gap-4 mt-6">
					<FileText size={18} />
					<Layers size={18} />
				</div>
			) : (
				<div className="overflow-y-auto h-full">
					{/* PAGES */}
					<SidebarSection
						title="Pages"
						icon={<FileText size={14} />}
						expanded={pagesExpanded}
						onToggle={() => setPagesExpanded((v) => !v)}
					>
						{pages.map((page) => (
							<PageItem
								key={page.id}
								page={page}
								active={page.id === selectedPageId}
								onSelect={() => selectPage(page.id)}
							/>
						))}
					</SidebarSection>

					<div className="h-px bg-neutral-800/50 mx-2" />

					{/* LAYERS (static for now) */}
					<SidebarSection
						title="Layers"
						icon={<Layers size={14} />}
						expanded={layersExpanded}
						onToggle={() => setLayersExpanded((v) => !v)}
					>
						<div className="px-3 py-1.5 text-neutral-500 text-sm">
							Coming soon
						</div>
					</SidebarSection>
				</div>
			)}

			{/* Resize handle */}
			<div
				onMouseDown={startResize}
				className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-sky-500/40"
			/>
		</div>
	);
}

/* ---------------- Components ---------------- */

function SidebarSection({ title, icon, children, expanded, onToggle }) {
	return (
		<div className="py-3">
			<button
				onClick={onToggle}
				className="w-full px-3 py-1.5 flex items-center gap-2 text-xs text-neutral-400 hover:bg-neutral-800/50"
			>
				{icon}
				<span className="flex-1 text-left uppercase tracking-wider">
					{title}
				</span>
				<ChevronDown size={14} className={expanded ? "" : "-rotate-90"} />
			</button>
			{expanded && <div className="px-2 mt-1">{children}</div>}
		</div>
	);
}

function PageItem({ page, active, onSelect }) {
	const renamePage = usePageStore((s) => s.renamePage);

	const [editing, setEditing] = useState(false);
	const [value, setValue] = useState(page.name);

	const commit = () => {
		const trimmed = value.trim();
		if (!trimmed || trimmed === page.name) {
			setEditing(false);
			return;
		}

		// Send rename request to server via custom event
		if (import.meta.hot) {
			import.meta.hot.send("pages:rename", {
				from: page.id,
				to: trimmed,
			});

			console.log(`[client] sent rename request: ${page.id} → ${trimmed}`);
		}

		// Update UI immediately (optimistic update)
		usePageStore.setState((state) => ({
			pages: state.pages.map((p) =>
				p.id === page.id ? { ...p, name: trimmed } : p
			),
		}));

		setEditing(false);
	};

	return (
		<div
			onClick={onSelect}
			onDoubleClick={(e) => {
				e.stopPropagation();
				setEditing(true);
			}}
			className={`px-3 py-1.5 rounded text-sm cursor-pointer ${
				active
					? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
					: "hover:bg-neutral-800 text-neutral-300"
			}`}
		>
			{editing ? (
				<input
					autoFocus
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onBlur={commit}
					onKeyDown={(e) => {
						if (e.key === "Enter") commit();
						if (e.key === "Escape") {
							setValue(page.name);
							setEditing(false);
						}
					}}
					className="w-full bg-neutral-900 border border-sky-500/40 rounded px-1 outline-none"
				/>
			) : (
				page.name
			)}
		</div>
	);
}
